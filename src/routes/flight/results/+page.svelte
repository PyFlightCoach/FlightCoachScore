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
		<div class="col-auto align-self pt-3">
			<div class="row px-md-5">
				<div class="col-auto">
					<AnalysisSummary />
				</div>

				<h2>Total Score = {$totalScore}</h2>
			</div>
		</div>
	{/snippet}
</SideBarLayout>
