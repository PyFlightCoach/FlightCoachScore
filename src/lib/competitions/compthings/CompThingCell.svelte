<script lang="ts">
	import CompThingEditor from '$lib/competitions/compthings/ContestUpdater.svelte';
	import { getComps, setComp } from '$lib/stores/contests';
	import Popup from '$lib/components/Popup.svelte';
	import type { ContestManager } from '$lib/competitions/compthings/ContestManager';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let {
		thing,
		colspan = 1,
		showProperties = $bindable(false)
	}: { thing: ContestManager; colspan?: number; showProperties?: boolean } = $props();

	let whatAreMyChildren: string | undefined = $derived(
		thing.summary.what_am_i === 'Competition'
			? 'Stage'
			: thing.summary.what_am_i === 'Stage'
				? 'Round'
				: undefined
	);

	$inspect(thing.summary);
</script>

<th {colspan} class={`${thing.summary.is_open_now ? 'bg-secondary' : ''} p-0`}>
	<div class="dropdown">
		<button
			class="btn btn-outline-light w-100 "
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
				{:else}
					<button
						class="dropdown-item"
						onclick={() => {
							thing
								.addChild(`${whatAreMyChildren} ${thing.children.length + 1}`)
								.then(setComp)
								.catch((e) => alert(`Failed to create round: ${e}`));
						}}
					>
						Add new {whatAreMyChildren}
					</button>
				{/if}
				<button
					class="dropdown-item"
					onclick={() => {
						if (confirm(`Are you sure you want to delete this ${thing.summary.what_am_i}?`)) {
							thing
								.delete()
								.then((res) => {
									new Promise(async () => {
										if (thing.summary.what_am_i === 'Competition') {
											getComps();
											await goto(resolve('/'));
										}
										setComp(res);
									});
								})
								.catch((err) => {
									alert(`Failed to delete ${thing.summary.what_am_i}: ${err}`);
								});
						}
					}}>Delete</button
				>
			{/if}
		</div>
	</div>
</th>
<Popup bind:show={showProperties}>
	<div class="text-dark">
		<CompThingEditor
			{thing}
			oncreated={() => {
				showProperties = false;
			}}
		/>
	</div>
</Popup>
