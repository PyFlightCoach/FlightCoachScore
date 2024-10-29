<script lang="ts">
	import NavMenu from '$lib/components/NavMenu.svelte';
	import { base } from '$app/paths';
	import { manNames, bin } from '$lib/stores/analysis';
	import { clearAnalysis, loadExample } from '$lib/analysis/analysis';
	import { goto } from '$app/navigation';
</script>

<NavMenu>
	<span slot="icon"><i class="bi bi-airplane"></i></span>
	{#if $bin}
      <h5 class="dropdown-header">{$bin.name}</h5>
  {:else if $manNames}
    <h5 class="dropdown-header">Example Loaded</h5>
  {/if}
  {#if $manNames}
		<button
			class="dropdown-item"
			on:click={() => {
				clearAnalysis();
				goto(`${base}/`);
			}}>Clear</button
		>
		<a class="dropdown-item" href={base + '/flight/results'}>Results</a>
	{:else}
		<a class="dropdown-item" href={base + '/flight/create/data'}>Create</a>
		<div class="dropdown-item">Import</div>
		<button
			class="dropdown-item"
      on:click={() => {
				loadExample().then(() => {goto(base + '/flight/results')});
			}}
		>
			Example
		</button>
	{/if}
</NavMenu>
