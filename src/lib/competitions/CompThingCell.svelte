<script lang="ts">

	import CompThingEditor from '$lib/competitions/ContestUpdater.svelte';
	import {  setComp } from '$lib/stores/contests';
	import Popup from '$lib/components/Popup.svelte';
	import type { ContestManager } from './ContestManager';

	let {
		thing,
		showProperties = $bindable(false)
	}: { thing: ContestManager; showProperties?: boolean } = $props();
</script>

<div class="dropdown">
	<button
		type="button"
		class="nav-link dropdown-toggle"
		data-bs-toggle="dropdown"
		aria-haspopup="true"
		aria-expanded="false"
		title="{thing.summary.what_am_i} options"
	>
		{thing.summary.name}
	</button>
	<div class="dropdown-menu">
		<button
			class="dropdown-item"
			onclick={() => {
				showProperties = !showProperties;
			}}>Properties</button
		>
		{#if thing.isMyComp}
			{#if thing.summary.what_am_i === 'Round'}
				<button
					class="dropdown-item"
					onclick={() => {
						thing
							.toggle_open()
							.then(setComp)
							.catch((err) => {
								alert(
									`Failed to ${thing.summary.is_open_now ? 'close' : 'open'} ${thing.summary.what_am_i}: ${err.response?.data?.detail || err}`
								);
							});
					}}
				>
					{thing.summary.is_open_now ? 'Close' : 'Open'}
				</button>
			{/if}
			<button
				class="dropdown-item"
				onclick={() => {
					if (confirm(`Are you sure you want to delete this ${thing.summary.what_am_i}?`)) {
            thing.delete()
            .then(res=>setComp(res!))
							.catch((err) => {
								alert(`Failed to delete ${thing.summary.what_am_i}: ${err}`);
							});
					}
				}}>Delete</button
			>
		{/if}
	</div>
</div>
<Popup bind:show={showProperties}>
	<CompThingEditor {thing}/>
</Popup>
