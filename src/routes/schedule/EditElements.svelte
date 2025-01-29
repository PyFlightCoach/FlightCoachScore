<script lang="ts">
	import { PE, peCompare, peSummary } from '$lib/schedules/aresti';
	import { builder } from '$lib/schedules/builder';
	import { map } from 'lodash';
	import EditElement from './EditElement.svelte';

	let {
		pes = $bindable(),
		canEdit = $bindable(),
		onchange = () => {},
		refpes = $bindable(),
		activeElID = $bindable(undefined),
    ndmps
	}: {
		pes: (PE | number)[];
		canEdit?: boolean;
		onchange?: (new_pes: (PE | number)[]) => void;
		refpes: (PE | number)[];
		activeElID?: number | undefined;
    ndmps: Record<string, number[][]>;
	} = $props();

	let isPeUpdated = $derived(
		pes.map((pe, i) => (typeof pe == 'number' ? false : !peCompare(refpes[i] as PE, pe as PE)))
	);
</script>

{#each pes as pe, i}
	{#if typeof pe != 'number'}
		<div class="container-fluid">
			<div class="row">
				<button
					class="col btn btn-outline-secondary"
					onclick={() => {
						if (activeElID == i) {
							activeElID = undefined;
						} else {
							activeElID = i;
						}
					}}
				>
					{peSummary(pe, $builder!.element_builders[pe.kind])}
					{#if activeElID == i}
						<i class="bi bi-chevron-up"></i>
					{:else}
						<i class="bi bi-chevron-down"></i>
					{/if}
					{#if isPeUpdated[i]}
						<span class="badge bg-warning">Updated</span>
					{/if}
				</button>
        {#if canEdit}
				<button
					class=" col-auto btn btn-outline-secondary"
					disabled={!canEdit}
					onclick={() => {
						activeElID = undefined;
						pes.splice(i, 1);
					}}
					aria-label="Delete"
          title="Delete this Element"
				>
					<i class="bi bi-trash"></i>
				</button>
        {/if}
			</div>
		</div>
	{/if}

	{#if activeElID == i && typeof pe != 'number'}
		<EditElement bind:pe={pes[i] as PE} refpe={refpes[i] as PE} builder={$builder!} {canEdit} {ndmps} />
	{/if}
{/each}

<div class="row pt-2">
	<label class="col col-form-label" for="add_element">Append</label>
	<div class="col btn-group" id="add_element">
		{#each Object.keys($builder!.element_builders) as elkind}
			<button
				class="btn btn-outline-secondary"
				disabled={!canEdit}
				data-sveltekit-preload-data="tap"
				onclick={() => {
					pes.push(
						$state.snapshot(
							new PE(
								elkind,
								Array.from({ length: $builder!.element_builders[elkind].args.length }).map(() => 0),
								{}
							)
						)
					);
				}}
			>
				{elkind}
			</button>
		{/each}
	</div>
</div>
