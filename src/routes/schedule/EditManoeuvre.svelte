<script lang="ts">
	import { ManoeuvreHandler } from '$lib/schedules/manoeuvre_handler';
	import * as mi from '$lib/schedules/maninfo';
	import EnumSelect from '$lib/components/EnumSelect.svelte';
	import { dbServer } from '$lib/api';
	import { loadSchedulesforUser } from '$lib/schedules/library';
	import { user } from '$lib/stores/user';
	import EditElements from './EditElements.svelte';
	import { Figure } from '$lib/schedules/aresti';
	import { rule, mans } from '$lib/schedules/schedule_builder';
	import { loading } from '$lib/stores/shared';

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
	let newInfo = $state(structuredClone($mans[id].info));
	let newElements = $state(structuredClone($mans[id].aresti?.elements));
	let newNdMps = $state(structuredClone($mans[id].aresti?.ndmps));

	//let newFigure: Figure | undefined = $derived(Figure.parse(newFig!));

	const reset = () => {
    activeElID = undefined;
		newInfo = structuredClone($mans[id].info);
		newElements = structuredClone($mans[id].aresti?.elements);
		newNdMps = structuredClone($mans[id].aresti?.ndmps);
	};

	const reload = () => {
		if ($mans[id].dbManoeuvre) {
			$loading = true;
			ManoeuvreHandler.parseDB($mans[id].dbManoeuvre)
				.then((res) => {$mans[id] = res; reset();})        
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
				.then((res) => ($mans[id] = res))
				.catch((e) => console.error(e))
				.finally(() => ($loading = false));
		}
	};
</script>

<div class="container-fluid">
	{#if canEdit}
		<div class="btn-group w-100">
			<button
				class="col btn btn-outline-secondary"
				title="Reload from the database"
				onclick={reload}
			>
				Reload
			</button>
			<button class="col btn btn-outline-secondary" title="Undo active changes" onclick={reset}>
				Reset
			</button>
			<button
				class="col btn btn-outline-secondary"
				title="Rebuild the definition and template and store active changes. This will not update the database entry."
				onclick={update}>Update</button
			>
			<button class="col btn btn-outline-secondary" title="Update the database entry" disabled
				>Patch</button
			>
			<button
				class="col btn btn-outline-secondary"
				title="delete database entry"
				onclick={() => {
					if (
						confirm(
							'Are you sure you want to delete this $mans[id]? Please check the next $mans[id] will link to the previous one first.'
						)
					) {
						if ($mans[id].dbManoeuvre) {
							dbServer.delete(`schedule/$mans[id]/${$mans[id].dbManoeuvre.id}`).then(() => {
								loadSchedulesforUser('admin@fcscore.org');
								if ($user) loadSchedulesforUser($user.email);
							});
						}
						ondelete();
					}
				}}>Delete</button
			>
		</div>
	{/if}
	{#if newInfo && $mans[id].info}
		<div class="row pt-2">
			<table class="table table-sm table-borderless">
				<thead>
					<tr>
						<th></th>
						<th>Entry</th>
						<th>Exit</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Height</td>
						<td class="p-0">
							<EnumSelect
								options={[...mi.Heights]}
								bind:value={newInfo.start.height}
								bind:canEdit
								undefValue="Infer"
								bind:refValue={$mans[id].info.start.height}
							/>
						</td>
						<td class="p-0">
							<EnumSelect
								options={[...mi.Heights]}
								bind:value={newInfo.end.height}
								bind:canEdit
								undefValue="Infer"
								bind:refValue={$mans[id].info.end.height}
							/>
						</td>
					</tr>
					<tr>
						<td>Direction</td>
						<td class="p-0">
							<EnumSelect
								options={[...mi.Directions]}
								bind:value={newInfo.start.direction}
								bind:canEdit
								undefValue="Infer"
								bind:refValue={$mans[id].info.start.direction}
							/>
						</td>
						<td class="p-0">
							<EnumSelect
								options={[...mi.Directions]}
								bind:value={newInfo.end.direction}
								bind:canEdit
								undefValue="Infer"
								bind:refValue={$mans[id].info.end.direction}
							/>
						</td>
					</tr>
					<tr>
						<td>Orientation</td>
						<td class="p-0">
							<EnumSelect
								options={[...mi.Orientations]}
								bind:value={newInfo.start.orientation}
								bind:canEdit
								undefValue="Infer"
								bind:refValue={$mans[id].info.start.orientation}
							/>
						</td>
						<td class="p-0">
							<EnumSelect
								options={[...mi.Orientations]}
								bind:value={newInfo.end.orientation}
								bind:canEdit
								undefValue="Infer"
								bind:refValue={$mans[id].info.end.orientation}
							/>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		{#if newElements && $mans[id].aresti}
			<div class="row pt-2">
				<EditElements
					bind:pes={newElements}
					{canEdit}
					bind:refpes={$mans[id].aresti.elements}
					bind:activeElID
				/>
			</div>
		{/if}
	{:else}
		<div class="row pt-2"><span>You must be logged in to view $mans[id] information</span></div>
	{/if}
</div>
