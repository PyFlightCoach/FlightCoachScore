<script lang="ts">
	import { State, States } from '$lib/utils/state';
	import Plot from './Plotly.svelte';
	import { ribbon, plotCorners } from '$lib/plots/traces';
	import { d3Color } from './styling';
	import colddraft from '$lib/plots/colddraft';
	
	let {
		sts = $bindable(),
		activeEl = $bindable(),
		scale = 1,
		defaultValue = undefined,
		labels = {},
		expand = 0,
		hideAxes = false,
		canSelect = true,
		hoverinfo = 'all',
		models = undefined
	}: {
		sts: Record<string, States>;
		activeEl?: string | undefined;
		scale?: number;
		defaultValue?: string | undefined;
		labels?: Record<string, string>;
		expand?: number;
		hideAxes?: boolean;
		canSelect?: boolean;
		hoverinfo?: string;
		models?: 'start_end' | 'splits' | undefined;
	} = $props();

	let last_changed = $state(Date.now());
	let scale_multiplier = 5;

	const traces = $derived.by(() => {
		let traces: Record<string, any>[] = Object.entries(sts).map(([k, v], i) => {
			if (k == activeEl || !activeEl || !Object.keys(sts).includes(activeEl)) {
				return ribbon(
					v,
					scale * scale_multiplier,
					{},
					{ opacity: 0.8, showlegend: false, color: d3Color(i), name: k, hoverinfo }
				);
			} else {
				return ribbon(
					v,
					scale * scale_multiplier,
					{},
					{ opacity: 0.2, showlegend: false, color: d3Color(i), name: k, hoverinfo }
				);
			}
		});

		return traces;
	});

	const model_traces = $derived.by(() => {
		let msts: State[] = [];
		const cd = colddraft.scale(scale * scale_multiplier * 0.6);
		switch (models) {
			case 'start_end':
				msts.push(Object.values(sts)[0].last);
				msts.push(Object.values(sts)[Object.values(sts).length - 1].last);
				break;
			case 'splits':
				Object.values(sts).forEach((st) => {
					msts.push(st.last);
				});
				break;
		}
		return msts.map((st, i) => {
			return cd.to_mesh3d(st.pos, st.att, { opacity: 1.0, hoverinfo: 'skip', color: 'grey' });
		});
	});

	const cornerTrace = $derived(
		plotCorners(new States([].concat(...Object.values(sts).map((v) => v.data)), expand, 0))
	);

	let layout = $derived.by(() => {
		const annotations: Record<string, any>[] = [];
		if (Object.keys(labels).length) {
			Object.entries(labels).forEach(([k, v]) => {
				if (v) {
					const pos = sts[k].data[Math.round(sts[k].data.length / 2)].pos;
					annotations.push({
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
		return {
			legend: { font: { size: 20 }, yanchor: 'top', y: 0.99, xanchor: 'left', x: 0.01 },
			margin: { l: 0, r: 0, t: 0, b: 0 },
			scene: {
				aspectmode: 'data',
				camera: {
					up: { x: 0, y: 0, z: 1 },
					center: { x: 0, y: 0, z: 0 },
					eye: { x: 0, y: -2.5, z: -1 },
					projection: { type: 'perspective' }
				},
        xaxis: {visible:!hideAxes},
        yaxis: {visible:!hideAxes},
        zaxis: {visible:!hideAxes},
				annotations
			}
		};
	});

	//  let layout = $state(structuredClone(layout3d));
</script>

<div class="container-fluid h-100 d-flex flex-column p-0">
	<div class="col">
		<Plot
			data={[...traces, ...model_traces, cornerTrace]}
			{layout}
			onclick={(e) => {
				if (Date.now() - last_changed > 100 && canSelect && e.points?.length) {
					if (activeEl != e.points[0].data.name) {
						activeEl = e.points[0].data.name;
					} else {
						activeEl = defaultValue;
					}
					last_changed = Date.now();
				}
			}}
		/>
	</div>
</div>
