<script lang="ts">
	import { manNames } from '$lib/stores/analysis';
	import ManSummary from './ManSummary.svelte';
	import { analyseAll } from '$lib/analysis/analysis';
</script>

<div class="table-responsive">
<table
	class="table table-sm table-hover table-bordered"
	data-sveltekit-preload-data="tap"
>
	<thead>
		<tr>
			<th scope="col">#</th>
			<th scope="col">Name</th>
			<th scope="col" class="text-center">K</th>
			<th scope="col" class="text-center">Intra</th>
			<th scope="col" class="text-center">Inter</th>
			<th scope="col" class="text-center">Box</th>
			<th scope="col" class="text-center">Score</th>
      <th scope="col" class="p-0">
			<button
				data-toggle="tooltip"
				title="Run Remaining"
				
				class="btn btn-outline-primary btn-sm text-nowrap w-100"
				on:click={() => analyseAll()}
        on:dblclick={() => analyseAll(true)}
      >
        Run All
      </button>
    </th>
			<th scope="col" style="max-width:200px">Status</th>
		</tr>
	</thead>
	<tbody>
		{#if $manNames}
			{#each $manNames as mname, i}
				<ManSummary id={i} />
			{/each}
		{/if}
	</tbody>
</table>
</div>