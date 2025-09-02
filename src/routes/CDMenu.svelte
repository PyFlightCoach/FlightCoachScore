<script lang="ts">
	import { resolve } from '$app/paths';
	import NavMenu from './NavMenu.svelte';
	import { ContestManager } from '$lib/competitions/ContestManager';
	import { setComp, cdComps, activeComp, getComps } from '$lib/stores/contests';
	import { goto } from '$app/navigation';
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
			const name = prompt('Enter new competition name:');
			if (name) {
				ContestManager.createEmptyCompetition(name)
					.then((res) => {
						setComp(res);
						goto(resolve(`/competition/view`));
					})
          .then(getComps)
					.catch((error) => {
						alert('Error creating competition: ' + error);
					});
			}
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
