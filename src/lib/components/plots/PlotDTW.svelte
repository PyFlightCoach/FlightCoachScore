<script lang="ts">
	import type { States } from '$lib/analysis/state';
	import Plot from 'svelte-plotly.js';
	import { ribbon } from '$lib/components/plots/traces';
	import { layout3d } from '$lib/components/plots/layouts';
	import { d3Color } from './styling';

	let {
		sts,
		activeEl = $bindable(),
		sp = 3,
		defaultValue = undefined,
		labels = {},
    showModels = false
	}: {
		sts: Record<string, States>;
		activeEl?: string | undefined;
		sp?: number;
		defaultValue?: string | undefined;
		labels?: Record<string, string>;
    showModels?: boolean;
	} = $props();

	let last_changed = $state(Date.now());

	const traces = $derived.by(() => {
		let traces: Record<string, any>[] = Object.entries(sts).map(([k, v], i) => {
			if (k == activeEl || !activeEl || !Object.keys(sts).includes(activeEl)) {
				return ribbon(v, sp, {}, { opacity: 0.8, showlegend: false, color: d3Color(i), name: k });
			} else {
				return ribbon(v, sp, {}, { opacity: 0.2, showlegend: false, color: d3Color(i), name: k });
			}
		});

    return traces
	});
  
  let layout = $derived.by(()=>{
    
    const lay = structuredClone(layout3d);
    lay.scene.annotations = [];
    if (Object.keys(labels).length) {
      Object.entries(labels).forEach(([k,v])=>{
        if (v) {
          const pos = sts[k].data[Math.round(sts[k].data.length / 2)].pos;
          lay.scene.annotations.push({
            x: pos.x,
            y: pos.y,
            z: pos.z,
            text: v,
            font: {size: 18},
            showarrow: false
          });
        }
      })
    }
    return lay;
  })

//  let layout = $state(structuredClone(layout3d));

  

</script>

<Plot
	data={traces}
	layout={layout}
	fillParent={true}
	on:click={(e) => {
    
		if (Date.now() - last_changed > 100) {
			if (activeEl != e.detail.points[0].data.name) {
				activeEl = e.detail.points[0].data.name;
			} else {
				activeEl = defaultValue;
			}
			last_changed = Date.now();
		}
	}}
/>
