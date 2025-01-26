<script lang="ts">
	import { ManoeuvreHandler } from '$lib/schedules/manoeuvre_handler';
	import * as mi from '$lib/schedules/maninfo';
	import { dbServer } from '$lib/api';
	import { loadSchedulesforUser } from '$lib/schedules/library';
	import { user } from '$lib/stores/user';
	import EditElements from './EditElements.svelte';
	import { Figure } from '$lib/schedules/aresti';
	import { rule, mans } from '$lib/schedules/schedule_builder';
	import { loading } from '$lib/stores/shared';
	import { faVersion } from '$lib/api';
	import EditManinfo from './EditManinfo.svelte';
	import EditManParms from './EditManParms.svelte';

	let {
		id,
		entry = undefined,
		canEdit = false,
		ondelete = () => {}
	}: {
		id: number;
		entry?: mi.BoxLocation | undefined;
		canEdit?: boolean;
		ondelete?: () => void;
	} = $props();

	let activeElID: number | undefined = $state(undefined);
	let newInfo = $state($state.snapshot($mans[id].info));
	let newElements = $state($state.snapshot($mans[id].aresti?.elements));
	let newNdMps = $state($state.snapshot($mans[id].aresti?.ndmps));

	//let newFigure: Figure | undefined = $derived(Figure.parse(newFig!));

	const reset = () => {
		activeElID = undefined;
		newInfo = $state.snapshot($mans[id].info);
		newElements = $state.snapshot($mans[id].aresti?.elements);
		newNdMps = $state.snapshot($mans[id].aresti?.ndmps);
	};

	const reload = () => {
		if ($mans[id].dbManoeuvre) {
			$loading = true;
			ManoeuvreHandler.parseDB($mans[id].dbManoeuvre)
				.then((res) => {
					$mans[id] = res;
					reset();
				})
				.catch((e) => console.error(e))
				.finally(() => ($loading = false));
		} else if ($mans[id].olan) {
			// TODO parse olan again
		}
	};

	const update = async () => {
		if ($mans[id].aresti) {
			const newFigure = new Figure(newInfo, newElements, newNdMps, $mans[id].aresti.relax_back);
			$loading = true;
			activeElID = undefined;
			await ManoeuvreHandler.parseAresti(
				$rule as string,
				newFigure!,
				$mans[id].dbManoeuvre,
				$mans[id].olan
			)
				.then((res) => {
					$mans[id] = res;
					reset();
				})
				.catch((e) => console.error(e))
				.finally(() => ($loading = false));
		}
	};
	const patch = async () => {
		if (confirm('Are you sure you want to update this manoeuvre?')) {
			if ($mans[id].aresti && $mans[id].definition && $mans[id].dbManoeuvre && faVersion && $user) {
				$loading = true;
				dbServer
					.patch(`schedule/manoeuvre/${$mans[id].dbManoeuvre.id}`, {
						version: faVersion,
						aresti: $mans[id].aresti,
						definition: $mans[id].definition
					})
					.then(async (res) => {
						await loadSchedulesforUser('admin@fcscore.org');
						await loadSchedulesforUser($user.email);
					})
					.then(reload)
					.catch((e) => console.error(e))
					.finally(() => ($loading = false));
			}
		}
	};

	const deleteMan = async () => {
		if (
			confirm(
				'Are you sure you want to delete this manoeuvre? Please check the next manoeuvre will link to the previous one first.'
			)
		) {
			if ($mans[id].dbManoeuvre) {
				dbServer.delete(`schedule/$mans[id]/${$mans[id].dbManoeuvre.id}`).then(() => {
					loadSchedulesforUser('admin@fcscore.org');
					if ($user) loadSchedulesforUser($user.email);
				});
			}
		}
		ondelete();
	};
	let showInfo = $state(true);
	let showNdMps = $state(false);
</script>

<div class="container-fluid">
	{#if canEdit}
		<div class="btn-group w-100">
			<button
				class="col btn btn-outline-secondary"
				title="Reload from the database"
				onclick={reload}
				disabled={$mans[id].dbManoeuvre === undefined}
			>
				Reload
			</button>
			<button
				class="col btn btn-outline-secondary"
				title="Undo active changes to match the stored manoeuvre"
				onclick={reset}
			>
				Reset
			</button>
			<button
				class="col btn btn-outline-secondary"
				title="Rebuild the definition and template and store active changes. This will not update the database entry."
				onclick={update}
			>
				Update
			</button>
			<button
				class="col btn btn-outline-secondary"
				title="Update the database entry based on the stored manouevre. You should rebuild the definition and store active changes by clicking update first."
				onclick={patch}
			>
				Patch
			</button>
			<button
				class="col btn btn-outline-secondary"
				title="Delete this manoeuvre and the database entry"
				onclick={deleteMan}>Delete</button
			>
		</div>
	{/if}
	{#if newInfo && $mans[id].info}
		<div class="row pt-2">
			<button class="btn btn-outline-secondary w=100" onclick={() => (showInfo = !showInfo)}>
				Manoeuvre Info {#if showInfo}<i class="bi bi-chevron-up"></i>{:else}<i
						class="bi bi-chevron-down"
					></i>{/if}
			</button>
		</div>
		{#if showInfo}
			<EditManinfo bind:newInfo oldInfo={$mans[id].info} bind:canEdit />
		{/if}
		{#if newNdMps && $mans[id].aresti}
			<div class="row pt-2">
				<button class="btn btn-outline-secondary w-100" onclick={() => (showNdMps = !showNdMps)}>
					Manoeuvre Parameters {#if showNdMps}<i class="bi bi-chevron-up"></i>{:else}<i
							class="bi bi-chevron-down"
						></i>{/if}
				</button>
			</div>
			{#if showNdMps}
				<EditManParms bind:newParms={newNdMps} oldParms={$mans[id].aresti!.ndmps} bind:canEdit />
			{/if}
		{/if}
		{#if newElements && $mans[id].aresti && newNdMps}
			<div class="row pt-2">
				<EditElements
					bind:pes={newElements}
					bind:canEdit
					refpes={$mans[id].aresti.elements}
					bind:activeElID
          ndmps={newNdMps}
				/>
			</div>
		{/if}
	{:else}
		<div class="row pt-2"><span>You must be logged in to view $mans[id] information</span></div>
	{/if}
</div>
