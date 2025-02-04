<script lang="ts">
	import { State, States } from '$lib/utils/state';
	import Plot from 'svelte-plotly.js';
	import { ribbon } from '$lib/components/plots/traces';
	import { create3DLayout } from '$lib/components/plots/layouts';
	import { d3Color } from './styling';
	import colddraft from '$lib/components/plots/colddraft';

	let {
		sts,
		activeEl = $bindable(),
		sp = 3,
		defaultValue = undefined,
		labels = {},
		expand = 0,
		hideAxes = false,
		canSelect = true,
		hoverinfo = 'all',
    models=undefined
	}: {
		sts: Record<string, States>;
		activeEl?: string | undefined;
		sp?: number;
		defaultValue?: string | undefined;
		labels?: Record<string, string>;
		expand?: number;
		hideAxes?: boolean;
		canSelect?: boolean;
		hoverinfo?: string;
    models?: 'start_end' | 'splits' | undefined;
	} = $props();

	let last_changed = $state(Date.now());

	const traces = $derived.by(() => {
		let traces: Record<string, any>[] = Object.entries(sts).map(([k, v], i) => {
			if (k == activeEl || !activeEl || !Object.keys(sts).includes(activeEl)) {
				return ribbon(
					v,
					sp,
					{},
					{ opacity: 0.8, showlegend: false, color: d3Color(i), name: k, hoverinfo }
				);
			} else {
				return ribbon(
					v,
					sp,
					{},
					{ opacity: 0.2, showlegend: false, color: d3Color(i), name: k, hoverinfo }
				);
			}
		});

		return traces;
	});


  const model_traces = $derived.by(()=>{
    let msts: State[] = [];
    const cd = colddraft.scale(sp*0.3)
    switch (models) {
      case "start_end": 
          msts.push(Object.values(sts)[0].last)
          msts.push(Object.values(sts)[Object.values(sts).length-1].last)
        break
      case "splits":
        Object.values(sts).forEach((st)=>{
          msts.push(st.last)
        })
        break
    }
    return msts.map((st, i) => {
      return cd.to_mesh3d(st.pos, st.att, { opacity: 1.0, hoverinfo: 'skip', color:'grey'});
    });
  });

	let layout = $derived.by(() => {
		let lay = create3DLayout(
			new States(
				Object.values(sts)
					.map((st) => st.data)
					.flat()
			),
			false,
			expand,
			hideAxes
		);

		lay.scene.annotations = [];
		if (Object.keys(labels).length) {
			Object.entries(labels).forEach(([k, v]) => {
				if (v) {
					const pos = sts[k].data[Math.round(sts[k].data.length / 2)].pos;
					lay.scene.annotations.push({
						x: pos.x,
						y: pos.y,
						z: pos.z,
						text: v,
						font: { size: 18 },
						showarrow: false
					});
				}
			});
		}
		return lay;
	});

	//  let layout = $state(structuredClone(layout3d));
</script>

<div class="container-fluid h-100 d-flex flex-column p-0">
	<div class="col">
		<Plot
			data={[...traces, ...model_traces]}
			{layout}
			fillParent={true}
			on:click={(e) => {
				if (Date.now() - last_changed > 100 && canSelect) {
					if (activeEl != e.detail.points[0].data.name) {
						activeEl = e.detail.points[0].data.name;
					} else {
						activeEl = defaultValue;
					}
					last_changed = Date.now();
				}
			}}
		/>
	</div>
</div>
