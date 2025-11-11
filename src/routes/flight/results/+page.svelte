<script lang="ts">
	import SideBarLayout from '$lib/components/SideBarLayout.svelte';
	import ResultsSidebar from './ResultsSidebar.svelte';
	import AnalysisSummary from './AnalysisSummary.svelte';
	import { totalScore } from '$lib/stores/analysis';
</script>

<SideBarLayout sideBarWidth={4}>
	{#snippet side()}
		<ResultsSidebar />
	{/snippet}

	{#snippet main()}
		<div class="container">
      <div class="row justify-content-center py-xxl-5">
			<div class="col-auto">
				<AnalysisSummary />
			</div>
      </div>
			<h2 class="row justify-content-center">Total Score = {$totalScore}</h2>
		</div>
	{/snippet}
</SideBarLayout>
