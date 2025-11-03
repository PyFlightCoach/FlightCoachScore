<script lang='ts'>
  import { selManID, analyses } from '$lib/stores/analysis';
  import PlotSec from '$lib/plots/PlotSec.svelte';
  import {isFullSize} from '$lib/stores/shared';
  import {States} from '$lib/utils/state';

  let man = $derived(analyses[$selManID!]);
  
  let flown = $derived($man?.flown instanceof States ? $man?.flown : $man?.flown.states());


</script>  
<div class="col">
  {#if flown} 
    <PlotSec flst={flown} i={1} expand={50} includeZero scale={$isFullSize ? 3 : 1.5}
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