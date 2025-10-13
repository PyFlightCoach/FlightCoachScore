<script lang="ts">
	import { reloadDropDownComps, setComp } from '$lib/stores/contests';
	import type { ContestManager } from '$lib/competitions/compthings/ContestManager';
	import { goto } from '$app/navigation';
	import CompThingEditor from './CompThingEditor.svelte';
	import Popup from '$lib/components/Popup.svelte';
	import DisplayDict from '$lib/components/DisplayDict.svelte';
	import { prettyPrintHttpError } from '$lib/utils/text';
	import { library } from '$lib/schedule/library';
	import { user } from '$lib/stores/user';
	import RunningOrderEditor from './RunningOrderEditor.svelte';

	let {
		parent = undefined,
		thing = $bindable(),
		colspan = 1
	}: {
		parent?: ContestManager | undefined;
		thing: ContestManager;
		colspan?: number;
		showEditor?: boolean;
	} = $props();

	let showEditor = $state(false);
	let showCreator = $state(false);
	let showProperties = $state(false);
  let showRunningOrder = $state(false);
	let active = $state(false);
</script>

<th
	{colspan}
	class={`${thing.summary.is_open_now ? 'bg-secondary' : ''} p-0 px-0`}
	class:active
	onmouseenter={() => {
		active = true;
	}}
	onmouseleave={() => {
		active = false;
	}}
>
	<button
		class="btn btn-link text-light w-100 text-nowrap text-decoration-none m-0"
		data-bs-toggle="dropdown"
		aria-haspopup="true"
		aria-expanded="false"
		title="{thing.summary.what_am_i} options"
	>
		{thing.summary.name}{#if thing.summary.schedule_id}, {$library.subset({
				schedule_id: thing.summary.schedule_id
			}).first.schedule_name}{/if}
	</button>
	<div class="dropdown-menu">
		<button
			class="dropdown-item"
			onclick={() => {
				showEditor = true;
			}}
		>
			{#if thing.isMyComp || $user?.is_superuser}
				Edit
			{:else}
				Info
			{/if}
		</button>
		{#if thing.isMyComp}
			{#if thing.summary.what_am_i === 'Round'}
        {#if thing.summary.result_rules?.score_from_stage_n === null}
				<button
					class="dropdown-item"
					onclick={() => {
						thing
							.toggle_open()
							.then(setComp)
							.catch((err) => {
								alert(
									`Failed to ${thing.summary.is_open_now ? 'close' : 'open'} ${thing.summary.what_am_i}: ${prettyPrintHttpError(err)}`
								);
							});
					}}
				>
					{thing.summary.is_open_now ? 'Close' : 'Open'}
				</button>
        {/if}
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
      {#if thing.summary.what_am_i === 'Stage'}
        <button
          class="dropdown-item"
          onclick={() =>{showRunningOrder = true;}}
        >
        Running Order
      </button>
      {/if}
			{#if thing.isMyComp || $user?.is_superuser}
				<button
					class="dropdown-item"
					onclick={() => {
						showProperties = true;
					}}>Attributes</button
				>
			{/if}
			<button
				class="dropdown-item"
				onclick={() => {
					if (confirm(`Are you sure you want to delete this ${thing.summary.what_am_i}?`)) {
						thing
							.delete()
							.then((res) => {
								if (thing.summary.what_am_i === 'Competition') {
									reloadDropDownComps();
									goto('/');
								} else {
                  setComp(res);
                }
							})
							.catch((err) => {
								alert(`Failed to delete ${thing.summary.what_am_i}: ${prettyPrintHttpError(err)}`);
							});
					}
				}}
			>
				Delete
			</button>
		{/if}
	</div>

	{#if showEditor}
		<CompThingEditor {parent} bind:show={showEditor} {thing} />
	{/if}
	{#if showCreator}
		<CompThingEditor parent={thing} bind:show={showCreator} />
	{/if}
  
  <Popup bind:show={showRunningOrder}>
    <RunningOrderEditor stage={thing} />
  </Popup>
  
	<Popup bind:show={showProperties}>
		<DisplayDict dict={thing.summary} />
	</Popup>
</th>

<style>
	.active {
		background: grey;
	}
</style>
