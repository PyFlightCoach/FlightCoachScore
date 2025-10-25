<script lang="ts">
	import SideBarLayout from '$lib/components/SideBarLayout.svelte';
	import ResultsSidebar from './ResultsSidebar.svelte';
	import AnalysisSummary from './AnalysisSummary.svelte';
	import { totalScore } from '$lib/stores/analysis';
	import * as nbc from '$lib/stores/navBarContents';

	nbc.reset();
</script>

<SideBarLayout sideBarWidth={4}>
	{#snippet side()}
		<ResultsSidebar />
	{/snippet}

	{#snippet main()}
		<div class="container-fluid">
			<div class="row justify-content-center">
				<div class="col-auto mt-4">
					<AnalysisSummary />
				</div>

				<h2 class="">Total Score = {$totalScore}</h2>
			</div>
		</div>
	{/snippet}
</SideBarLayout>
