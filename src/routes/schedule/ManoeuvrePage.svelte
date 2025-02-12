<script lang="ts">
	import PlotSec from '$lib/plots/PlotSec.svelte';
	import * as mh from '$lib/manoeuvre/manoeuvre_handler.svelte';
  import {points} from '$lib/plots/traces';
  import {getScale} from '$lib/schedule/schedule_handler.svelte';

	let { man, rule="f3a"}: { man: mh.ManoeuvreHandler, rule?:string} = $props();

  let states = man.template?.split();

	let centre_points = $derived(
		man.definition!.info.centre_points.map((i) => Object.values(states!)[i - 1].data.at(-1)!.pos)
	);
	let el_points = $derived(
		man.definition!.info.centred_els.map((i) => {
			let el = Object.values(states!)[i[0]].data;
			return el[Math.round(i[1] * el.length)].pos;
		})
	);
  const cpNames = $derived(man.definition!.info.centre_points.map((i) => 'Point '.concat(i.toString())));
  const ceNames = $derived(man.definition!.info.centred_els.map((i) => 'Element '.concat(i[0].toString())));
  
</script>

{#if man.template}
	<PlotSec flst={man.template} expand={50} exclude_controls={['slider', 'showBox']} fixRange hideAxes
    extraTraces={[...points(centre_points,cpNames), ...points(el_points,ceNames)]}
    scale={getScale(rule)}
  />
{/if}
