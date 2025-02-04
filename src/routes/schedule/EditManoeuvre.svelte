<script lang="ts">
	import { ManoeuvreHandler } from '$lib/manoeuvre/manoeuvre_handler.svelte';
	import { dbServer } from '$lib/api/api';
	import { reloadSchedules } from '$lib/schedule/library';
	import EditElements from './EditElements.svelte';
	import { loading } from '$lib/stores/shared';
	import EditManinfo from './EditManinfo.svelte';
	import EditCombinations from './EditCombinations.svelte';
	import EditComparisons from './EditComparisons.svelte';
	import type { ManBuilder } from '$lib/manoeuvre/builder.svelte';
	import { user } from '$lib/stores/user';

	let {
		manoeuvre = $bindable(),
		builder,
		canEdit = false,
		ondelete = () => {}
	}: {
		manoeuvre: ManoeuvreHandler;
		builder: ManBuilder;
		canEdit?: boolean;
		activeOption?: number;
		ondelete?: () => void;
	} = $props();

	let activeElID: number | undefined = $state(undefined);

	let newInfo = $state(manoeuvre.info.copy());
	let newFigure = $state(manoeuvre.aresti?.copy() || undefined);

	let mpValues = $derived(newFigure?.mpValues(builder) || {});

	const reset = () => {
		activeElID = undefined;
		newInfo = manoeuvre.info.copy();
		newFigure = manoeuvre.aresti?.copy() || undefined;
	};

	const reload = () => {
		if (manoeuvre.dbManoeuvre) {
			$loading = true;
			ManoeuvreHandler.parseDB(manoeuvre.dbManoeuvre)
				.then((res) => {
					manoeuvre = res;
					reset();
				})
				.catch((e) => console.error(e))
				.finally(() => ($loading = false));
		} else if (manoeuvre.olan) {
			// TODO parse olan again
		}
	};

	const update = async () => {
		if (newFigure) {
			$loading = true;
			activeElID = undefined;
			await ManoeuvreHandler.parseAresti(
				builder.rule,
				newInfo,
				newFigure,
				manoeuvre.dbManoeuvre,
				manoeuvre.olan
			)
				.then((res) => {
					manoeuvre = res;
					reset();
				})
				.catch((e) => console.error(e))
				.finally(() => ($loading = false));
		}
	};
	const patch = async () => {
		if (confirm('Are you sure you want to update this manoeuvre?')) {
			if (manoeuvre!.canPatch) {
				$loading = true;
				manoeuvre
					.patch()
					.then(reload)
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
			if (manoeuvre.dbManoeuvre) {
				dbServer.delete(`schedule/manoeuvre/${manoeuvre.dbManoeuvre.id}`).then(() => {
					reloadSchedules();
				});
			}
		}
		ondelete();
	};

	let showInfo = $state(true);
	let showNdMps = $state(false);
</script>

<div class="container-fluid">
	{#if manoeuvre.options.length > 1}
		<div class="row mb-2">
			<label class="col col-form-label text-start" for="optionselect">Select Option</label>
			<select
				class="col col-form-input form-select text-center"
				id="optionselect"
				bind:value={manoeuvre.activeOption}
				onchange={reset}
			>
				{#each manoeuvre.options as opt, i}
					<option value={i}>{i}</option>
				{/each}
			</select>
			{#if canEdit && ($user?.is_superuser || $user?.is_cd)}
				<button
					class="col-auto btn btn-outline-secondary"
					title="Add a new option"
					aria-label="Add a new option"
					onclick={() => {
						alert('Not implemented yet');
					}}
				>
					<i class="bi bi-plus-lg"></i>
				</button>
				<button
					class="col-auto btn btn-outline-secondary"
					onclick={() => {
						alert('Not implemented yet');
					}}
					title="Delete active option"
					aria-label="Delete active option"><i class="bi bi-trash"></i></button
				>
			{/if}
		</div>
	{/if}
	{#if canEdit}
		<div class="btn-group w-100">
			<button
				class="col btn btn-outline-secondary"
				title="Reload from the database"
				onclick={reload}
				disabled={manoeuvre.dbManoeuvre === undefined}
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
			{#if $user?.is_superuser || $user?.is_cd}
				<button
					class="col btn btn-outline-secondary"
					title="Update the database entry based on the stored manouevre. You should rebuild the definition and store active changes by clicking update first."
					onclick={patch}
					disabled={!manoeuvre.canPatch}
				>
					Patch
				</button>
				<button
					class="col btn btn-outline-secondary"
					title="Delete this manoeuvre and the database entry"
					onclick={deleteMan}>Delete</button
				>
			{/if}
		</div>
	{/if}
	{#if newInfo && newFigure}
		<div class="row pt-2">
			<button class="btn btn-outline-secondary w=100" onclick={() => (showInfo = !showInfo)}>
				Manoeuvre Info {#if showInfo}<i class="bi bi-chevron-up"></i>{:else}<i
						class="bi bi-chevron-down"
					></i>{/if}
			</button>
		</div>
		{#if showInfo}
			<EditManinfo bind:newInfo oldInfo={manoeuvre.info} {canEdit} />
			<div class="form-check">
				<input
					class="form-check-input"
					type="checkbox"
					id="relax_back"
					bind:checked={newFigure.relax_back}
					disabled={!canEdit}
				/>
				<label for="relax_back">Relax back box downgrade for this manoeuvre</label>
			</div>
		{/if}
		{#if newFigure && manoeuvre.aresti}
			<div class="row pt-2">
				<button class="btn btn-outline-secondary w-100" onclick={() => (showNdMps = !showNdMps)}>
					Manoeuvre Parameters {#if showNdMps}<i class="bi bi-chevron-up"></i>{:else}<i
							class="bi bi-chevron-down"
						></i>{/if}
				</button>
			</div>
			{#if showNdMps}
				<EditComparisons
					bind:newComps={newFigure.comparisons}
					oldComps={manoeuvre.aresti.comparisons}
					{builder}
					{canEdit}
				/>
				<EditCombinations
					bind:newCombos={newFigure.combinations}
					oldCombos={manoeuvre.aresti.combinations}
					{builder}
					{canEdit}
				/>
			{/if}
		{/if}
		{#if newFigure && manoeuvre.aresti}
			<div class="row pt-2">
				<EditElements
					bind:pes={newFigure.elements}
					{canEdit}
					refpes={manoeuvre.aresti.elements}
					bind:activeElID
					isCentreManoeuvre={newInfo.position == 'CENTRE'}
					{builder}
					{mpValues}
				/>
			</div>
		{/if}
	{:else}
		<div class="row pt-2"><span>You must be logged in to view manoeuvre information</span></div>
	{/if}
</div>
