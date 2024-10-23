<script lang="ts">
	import AnalysisSummary from './AnalysisSummary.svelte';
	import { totalScore, bin, selectedResult } from '$lib/stores/analysis';

</script>

<div class="container-sm pt-5">
	<div class="row justify-content-center">
		<div class="col-4 align-self-center">
      <p class="small" >Showing results for {$bin?.name || '(add DB Identifier)'} from analysis code version {$selectedResult}</p>
			<AnalysisSummary />
			<h2>Total Score = {$totalScore}</h2>
		</div>
	</div>
</div>
