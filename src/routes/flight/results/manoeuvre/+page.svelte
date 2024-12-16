<script lang='ts'>
  import { selManID, analyses, selectedResult, difficulty, truncate } from '$lib/stores/analysis';
  import PlotSec from '$lib/components/plots/PlotSec.svelte';
  $: man = analyses[$selManID!]
  $: result = $man?.history[$selectedResult!]?.get_score($difficulty, $truncate)?.score;

  
</script>  

<div class='col-auto pt-5 px-3'>
  {#if result}
    <table class="table">
      <thead>
        <tr>
          <th class="text-start">Group</th>
          <th class="text-center" >Total</th>
        </tr>
      </thead>
      <tbody>
        {#each Object.entries(result) as [key, value]}
          <tr>
            <td>{key}</td>
            <td class="text-center">{value.toFixed(2)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
    
  {/if}
</div>
<div class="col">
  {#if $man} 
    <PlotSec flst={$man.flown} i={1}, expand={50} includeZero/>
  {/if}
</div>

