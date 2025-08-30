<script lang="ts">
	import type { CompThingSummary } from '$lib/competitions/compInterfaces.js';
	import CompThingEditor from '$lib/competitions/CompThingCreateUpdate.svelte';
	import { dbServer } from '$lib/api';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { activeComp } from '$lib/stores/contests';
  import Popup from '$lib/components/Popup.svelte';

	let {
		thing,
		isMyComp,
		showProperties = $bindable(false)
	}: { thing: CompThingSummary; isMyComp: boolean; showProperties?: boolean } = $props();
</script>

<div class="dropdown">
	<button
		type="button"
		class="nav-link dropdown-toggle"
		data-bs-toggle="dropdown"
		aria-haspopup="true"
		aria-expanded="false"
		title="{thing.what_am_i} options"
	>
		{thing.name}
	</button>
	<div class="dropdown-menu">
		<button
			class="dropdown-item"
			onclick={() => {
				showProperties = !showProperties;
			}}>Properties</button
		>
		{#if isMyComp}
			<button
				class="dropdown-item"
				onclick={() => {
					if (confirm(`Are you sure you want to delete this ${thing.what_am_i}?`)) {
						dbServer
							.delete(`competition/${thing}`)
							.then(() => {
								if (thing.what_am_i == 'Competition') {
									goto(base);
								} else {
									dbServer.get(`competition/${$activeComp.id}`).then((res) => {
										$activeComp = res.data;
									});
								}
							})
							.catch((err) => {
								alert(`Failed to delete ${thing.what_am_i}: ${err}`);
							});
					}
				}}>Delete</button
			>
		{/if}
	</div>
</div>
<Popup bind:show={showProperties}>
  <CompThingEditor whatAmI={thing.what_am_i} {thing} {isMyComp}/>
</Popup>
