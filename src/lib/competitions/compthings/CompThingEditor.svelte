<script lang="ts">
	import CompetitionEditor from './CompetitionEditor.svelte';
	import StageEditor from './StageEditor.svelte';
	import RoundEditor from './RoundEditor.svelte';
	import type { ContestManager } from '$lib/competitions/compthings/ContestManager';
	import Popup from '$lib/components/Popup.svelte';

	let {
		show = $bindable(false),
    parent = undefined,
		thing = $bindable(undefined)
	}: {
		show?: boolean;
    parent?: ContestManager | undefined;
		thing?: ContestManager | undefined;
	} = $props();

	const whatToEdit = $derived(thing?.summary.what_am_i || parent?.whatAreMyChildren || "Competition");
  
</script>

<Popup bind:show>
	{#if whatToEdit == 'Competition'}
		<CompetitionEditor
			competition={thing}
			oncreated={() => {
				show = false;
			}}
		/>
	{:else if whatToEdit == 'Stage'}
		<StageEditor
			parent={parent!}
			stage={thing}
			oncreated={() => {
				show = false;
			}}
		/>
	{:else if whatToEdit == 'Round'}
		<RoundEditor
			stage={parent!}
			round={thing}
			oncreated={() => {
				show = false;
			}}
		/>
	{/if}
</Popup>
