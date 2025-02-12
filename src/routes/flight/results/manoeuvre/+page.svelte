<script lang='ts'>
  import { selManID, analyses } from '$lib/stores/analysis';
  import PlotSec from '$lib/plots/PlotSec.svelte';
  import {isFullSize} from '$lib/stores/shared';

  let man = $derived(analyses[$selManID!]);
  
</script>  
<div class="col">
  {#if $man && $man.flown} 
    <PlotSec flst={$man.flown} i={1} expand={50} includeZero scale={$isFullSize ? 3 : 1.5}
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