<script lang="ts">
	import SideBarLayout from '$lib/components/SideBarLayout.svelte';
	import ResultsSidebar from './ResultsSidebar.svelte';
	import AnalysisSummary from './AnalysisSummary.svelte';
	import { totalScore } from '$lib/stores/analysis';
	import * as nbc from '$lib/stores/navBarContents';
	import { user } from '$lib/stores/user';
  import { analyseAll } from '$lib/flight/analysis';
  

	nbc.reset();

	$effect(() => {
		if ($user?.is_superuser) {
			nbc.reset([
				{
					name: 'Optimise All',
					onclick: () => {
						analyseAll(true, true);
					},
					icon: 'bi-plus-circle',
					title: 'Load flight data',
					disabled: false
				}
			]);
		} else {
			nbc.reset();
		}
	});


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
