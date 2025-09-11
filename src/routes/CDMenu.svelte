<script lang="ts">
	import { resolve } from '$app/paths';
	import NavMenu from './NavMenu.svelte';
	import { ContestManager } from '$lib/competitions/compthings/ContestManager';
	import { setComp, cdComps, activeComp, getComps } from '$lib/stores/contests';
	import { goto } from '$app/navigation';
  import Popup from '$lib/components/Popup.svelte';
	import CompetitionEditor from '$lib/competitions/compthings/CompetitionEditor.svelte';

  let showPopup = $state(false);

</script>

<NavMenu tooltip="Contest Director Menu">
	<span slot="icon"><i class="bi {$activeComp ? 'bi-trophy-fill' : 'bi-trophy'}"></i> </span>
	{#if $activeComp}
		<div class="dropdown-header">{$activeComp.summary.name}</div>
		<div class="dropdown-divider"></div>
	{/if}
	<button
		class="dropdown-item"
		onclick={() => {
      showPopup = true;
		}}
		data-sveltekit-preload-data="tap">Create Competition</button
	>
  {#if $cdComps.length}
    <div class="dropdown-divider"></div>
    <small class="dropdown-header">My Competitions</small>
  {/if}
	{#each $cdComps as comp}
		<a
			class="dropdown-item {$activeComp?.summary.id==comp.summary.id ? 'active' : ''}"
			href={`/competition/load/?id=${comp.summary.id}`}
			data-sveltekit-preload-data="tap">{comp.summary.name}</a
		>
	{/each}
</NavMenu>
<Popup bind:show={showPopup} >
  <CompetitionEditor oncreated={() => { showPopup = false; getComps(); }} />
</Popup>