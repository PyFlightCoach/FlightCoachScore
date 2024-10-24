<script lang='ts'>
  import {base} from "$app/paths";
  import {manNames} from "$lib/stores/analysis"; 
  import {clearAnalysis} from '$lib/analysis/analysis';
	import { goto } from "$app/navigation";
</script>


<li class="nav-item">
<ul class="pagination">
    {#if $manNames && $manNames.length > 0}
      <li class="page-item"><button class="nav-link" on:click={()=>{clearAnalysis(); goto(base + '/')}}>Clear</button></li>
      <li class="page-item"><a class="nav-link" href={base + "/analysis/results"}>Results</a></li>
      <li class="page-item"><a class="nav-link" href={base + "/analysis/results/plot"}>Plot</a></li>
    {/if}
</ul>
</li>

