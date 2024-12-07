<script lang="ts">
	import AnalysisSummary from './AnalysisSummary.svelte';
	import { totalScore, bin, selectedResult, fa_versions } from '$lib/stores/analysis';
	import navBarContents from '$lib/stores/navBarContents';
	import AnalysisMenu from './ResultsMenu.svelte';
  import ToggleButton from '$lib/components/ToggleButton.svelte';
	
	$navBarContents = AnalysisMenu;
</script>

<div class="col-md-5 align-self pt-5">
  
  <div class="input-group">
    <button
		class="btn btn-outline-secondary dropdown-toggle form-control-sm "
		type="button"
		data-bs-toggle="dropdown"
		aria-expanded="false"
    style:overflow="hidden"
	>
		{$selectedResult}
	</button>
	<ul class="dropdown-menu">
    {#each $fa_versions as version}
      <li><ToggleButton bind:group={$selectedResult} value={version}>{version}</ToggleButton></li>
    {/each}
	</ul>


  </div>
	<p class="small">

    {#if $selectedResult}
		  Showing results for {$bin?.name || '(add DB Identifier)'} from analysis code version {$selectedResult}
    {:else if $fa_versions.length == 0}
      Run some analyses to view result
    {/if}
	</p>
	<AnalysisSummary />
	<h2>Total Score = {$totalScore}</h2>
</div>
