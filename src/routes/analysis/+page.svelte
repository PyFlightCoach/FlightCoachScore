<script lang="ts">
  import AnalysisSummary from './AnalysisSummary.svelte';
  import {totalScore, manNames} from '$lib/stores/analysis';
</script>



<div class="container">
  <div class="row"><AnalysisSummary/></div>
  <h2>Total Score = {$totalScore }</h2>  
</div>

