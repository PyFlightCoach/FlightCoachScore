<script lang="ts">
	import { activeComp, setComp } from '$lib/stores/contests';
	import Popup from '$lib/components/Popup.svelte';
	import type { PilotManager } from '$lib/competitions/competitors/PilotManager';

	let {
		competitor,
		showProperties = $bindable(false)
	}: { competitor: PilotManager; showProperties?: boolean } = $props();
</script>

<td class="p-0 h-100">
<div class="dropdown h-100">
	<button
		type="button"
		class="btn btn-outline-secondary w-100 "
		data-bs-toggle="dropdown"
		aria-haspopup="true"
		aria-expanded="false"
		title="Competitor options"
	>
		{competitor.competitor.name}
	</button>
	<div class="dropdown-menu">
		<button
			class="dropdown-item"
			onclick={() => {
				showProperties = !showProperties;
			}}>Properties</button
		>
		{#if $activeComp.isMyComp}
			<button
				class="dropdown-item"
				onclick={() => {
					if (confirm(`Are you sure you want to delete ${competitor.competitor.name}?`)) {
						competitor
							.delete()
							.then(setComp)
							.catch((err) => {
								alert(`Failed to delete ${competitor.competitor.name}: ${err}`);
							});
					}
				}}>Delete</button
			>
		{/if}
	</div>
</div>
</td>
<Popup bind:show={showProperties}>
	<ul class="list-unstyled">
		<li>{competitor.competitor.name || competitor.competitor.name_override}</li>
		<li>{competitor.competitor.country}</li>
		<li>{competitor.competitor.registration}</li>
	</ul>
</Popup>
