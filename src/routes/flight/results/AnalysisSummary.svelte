<script lang="ts">
	import { manNames } from '$lib/stores/analysis';
	import ManSummary from './ManSummary.svelte';
	import { analyseAll } from '$lib/analysis/analysis';
</script>

<table
	class="table table-sm table-hover table-bordered border-primary"
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
			<th scope="col">Score</th>
			<th
				role="button"
				data-toggle="tooltip"
				title="Run Remaining"
				scope="col"
				class="bg-primary text-center"
				on:click={() => analyseAll()}>Run</th
			>
			<th scope="col">Status</th>
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
