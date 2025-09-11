<script lang="ts">
	import { getComps, setComp } from '$lib/stores/contests';
	import type { ContestManager } from '$lib/competitions/compthings/ContestManager';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import CompThingEditor from './CompThingEditor.svelte';
  import Popup from '$lib/components/Popup.svelte';
  import DisplayDict from '$lib/components/DisplayDict.svelte';

	let {
    competition = undefined,
		parent = undefined,
		thing = $bindable(),
		colspan = 1
	}: {
    competition?: ContestManager | undefined;
		parent?: ContestManager | undefined;
		thing: ContestManager;
		colspan?: number;
		showEditor?: boolean;
	} = $props();

	let showEditor = $state(false);
	let showCreator = $state(false);
  let showProperties = $state(false);
</script>

<th {colspan} class={`${thing.summary.is_open_now ? 'bg-secondary' : ''} p-0`}>
	<div class="dropdown">
		<button
			class="btn btn-outline-light w-100"
			data-bs-toggle="dropdown"
			aria-haspopup="true"
			aria-expanded="false"
			title="{thing.summary.what_am_i} options"
		>
			{thing.summary.name}
		</button>
		<div class="dropdown-menu">
      <button class="dropdown-item" 
        onclick={() => { showProperties = true; }}
      >Properties</button>
			<button
				class="dropdown-item"
				onclick={() => {
					showEditor = true;
				}}>Edit</button
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
							showCreator = true;
						}}
					>
						Add New {thing.whatAreMyChildren}
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
{#if showEditor}
	<CompThingEditor {competition} bind:show={showEditor} {thing} />
{/if}
{#if showCreator}
	<CompThingEditor {competition} bind:show={showCreator} parent={thing} />
{/if}
<Popup bind:show={showProperties} >
  <DisplayDict dict={thing.summary} />
</Popup>  
</th>
