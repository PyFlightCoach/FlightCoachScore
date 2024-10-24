<script lang='ts'>
  import { selManID, analyses, selectedResult, difficulty, truncate } from '$lib/stores/analysis';
  import PlotSec from '$lib/components/plots/PlotSec.svelte';
  $: man = analyses[$selManID!]
  $: result = $man?.history[$selectedResult!]?.get_score($difficulty, $truncate)?.score;
</script>  

<div class='container'>
  <div class='col-4'>
    {#if result}
      {#each Object.entries(result) as [key, value]}
        <div>{key}</div><div>{value.toFixed(2)}</div>
      {/each}
    {/if}
  </div>
  <div class="col-8">
  {#if $man} 
    <PlotSec flst={$man.flown} i={1}/>
  {/if}
</div>
</div>

