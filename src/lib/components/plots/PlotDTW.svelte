<script lang='ts'>
  import type {States} from '$lib/analysis/state';
  import Plot from 'svelte-plotly.js';
  import {ribbon} from '$lib/components/plots/traces';
	import {layout3d} from '$lib/components/plots/layouts';
  import { d3Color } from './styling';
  
  
  export let sts: Record<string, States>;
  export let activeEl: string|null = null;
  export let sp: number=3;
  let last_changed = Date.now();
  $: traces = Object.entries(sts).map(([k,v], i) => {
    if ((k==activeEl) || (activeEl==null)) {
      return ribbon(v, sp, {}, {opacity: 0.8, showlegend:false, color: d3Color(i), name: k});
    } else {
      return ribbon(v, sp, {}, {opacity: 0.2, showlegend:false, color: d3Color(i), name: k});
    }
  })

</script>



<Plot 
  data={traces} layout={layout3d} fillParent={true}
  on:click={(e) => {
    if (Date.now() - last_changed > 100) {
      if (activeEl != e.detail.points[0].data.name) {
        activeEl = e.detail.points[0].data.name;
      } else {
        activeEl=null;
      }
      last_changed=Date.now();
    }
  }}
  
/>