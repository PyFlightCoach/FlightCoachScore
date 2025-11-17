<script lang='ts'>
  import type {States} from '$lib/utils/state';
  import Plot from './Plotly.svelte';
  import {ribbon} from '$lib/plots/traces';
	import {layout3d} from '$lib/plots/layouts';
  import { d3Color } from './styling';
  
  export let sts: Record<string, States>;
  export let activeEls: string[][]|null = null;
  export let sp: number=1;
  let scaleFactor = 5;
  $: traces = Object.entries(sts).map(([k,v], i) => {
    if ((activeEls != null)) {

      let ribbs = null;

      activeEls.forEach((els, j) => {
        if (els.includes(k)) {
          ribbs = ribbon(
            v, sp * scaleFactor, {}, 
            {opacity: 0.8, showlegend:false, color: d3Color(j), name: k}
          );
        }
      })
      if (ribbs == null) {
        ribbs = ribbon(
          v, sp * scaleFactor, {}, 
          {opacity: 0.2, showlegend:false, color: 'grey', name: k}
        );
      }
      return ribbs;
//      return ribbon(v, sp, {}, {opacity: 0.8, showlegend:false, color: d3Color(i), name: k});
    } else {
      return ribbon(v, sp  * scaleFactor, {}, {opacity: 0.2, showlegend:false, color: d3Color(i), name: k});
    }
  })

</script>



<Plot data={traces} layout={layout3d} config={{ responsive: true }}/>