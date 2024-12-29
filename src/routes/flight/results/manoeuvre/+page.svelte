<script lang='ts'>
  import { selManID, analyses, selectedResult, difficulty, truncate } from '$lib/stores/analysis';
  import PlotSec from '$lib/components/plots/PlotSec.svelte';
  $: man = analyses[$selManID!]
//  $: result = $man?.history[$selectedResult!]?.get_score($difficulty, $truncate)?.score;

  
</script>  
<div class="col">
  {#if $man && $man.flown} 
    <PlotSec flst={$man.flown} i={1} expand={50} includeZero 
    controls={[
      'slider',
      'play',
      'scale',
      'speed',
      'projection',
      'modelClick',
      'rangeEndClick',
      'rangeStartClick',
      'showBox'
    ]}/>
  {/if}
</div>