<script lang="ts">
	
	import Plot from './Plotly.svelte';
  import {states} from '$lib/stores/analysis';
  import { iacBoxTrace, f3aBoxTrace } from '$lib/flight/box/box_geometry';
  import {isFullSize} from '$lib/stores/shared';
	import { points, ribbon } from '$lib/plots/traces';
	import { layout3d } from '$lib/plots/layouts';
	import { Point } from '$lib/utils/geometry';

  let {shiftx=0, shifty=0, shiftz=0}: {shiftx?: number, shifty?: number, shiftz?: number} = $props();

  let boxfunc = $derived(
		$isFullSize ? iacBoxTrace : f3aBoxTrace
	);
  
  let plotstates = $derived($states!.shift(new Point(shiftx, shifty, shiftz)));
  $inspect(shiftx);
</script>


<Plot
  data={[
    ribbon(
      plotstates,
      $isFullSize ? 17 : 7,
      {},
    ),
    boxfunc()
  ]}
  layout={layout3d}
/>

