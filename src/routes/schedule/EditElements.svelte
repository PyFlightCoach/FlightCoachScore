<script lang="ts">
	import { PE, peCompare, peSummary } from '$lib/schedules/aresti';
	import { builder } from '$lib/schedules/schedule_builder';
	import { prototype } from 'jszip';
	import EditElement from './EditElement.svelte';

	let {
		pes = $bindable(),
		canEdit = false,
		onchange = () => {},
		refpes = $bindable(),
    activeElID = $bindable(undefined)
	}: {
		pes: (PE | number)[];
		canEdit?: boolean;
		onchange?: (new_pes: (PE | number)[]) => void;
		refpes: (PE | number)[];
    activeElID?: number | undefined
	} = $props();

	

	let isPeUpdated = $derived(
		pes.map((pe, i) => (typeof pe == 'number' ? false : !peCompare(refpes[i] as PE, pe as PE)))
	);
  $inspect(isPeUpdated)
</script>

{#each pes as pe, i}
	{#if typeof pe != 'number'}
		<button
			class="btn btn-outline-secondary"
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
	{/if}

	{#if activeElID == i && typeof pe != 'number'}
		<EditElement
			bind:pe={pes[i] as PE}
			bind:refpe={refpes[i] as PE}
			builder={$builder!}
			{canEdit}
		/>
	{/if}
{/each}
