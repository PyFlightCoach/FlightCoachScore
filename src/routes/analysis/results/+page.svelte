<script lang="ts">
	import AnalysisSummary from './AnalysisSummary.svelte';
	import { totalScore, bin, selectedResult } from '$lib/stores/analysis';
	import navBarContents from '$lib/stores/navBarContents';
	import AnalysisMenu from './ResultsMenu.svelte';
	$navBarContents = AnalysisMenu;
</script>

<div class="col-md-5 align-self pt-5">
	<p class="small">
		Showing results for {$bin?.name || '(add DB Identifier)'} from analysis code version {$selectedResult}
	</p>
	<AnalysisSummary />
	<h2>Total Score = {$totalScore}</h2>
</div>
