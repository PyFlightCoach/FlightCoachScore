<script lang="ts">
	import Plot from '$lib/plots/Plotly.svelte';
	import { modeltrace, ribbon } from '$lib/plots/traces';
	import { layout3d } from '$lib/plots/layouts';
	import { analyses, selManID } from '$lib/stores/analysis';
	import type { States } from '$lib/utils/state';
	import colddraft from '$lib/plots/colddraft.js';

	$: man = analyses[$selManID!];

	const make_trace = (tp: States, models: boolean, name: string, color: string) => {
		const trs = [ribbon(tp, 5, {}, { name, color })];

		if (models) {
			trs.push(...modeltrace(tp.downsample(20), colddraft, { name, color }));
		}
		return trs;
	};

	const make_traces = (bf: boolean, bi: boolean) => {
		const trs = [];
		if (bf) {
			trs.push(...make_trace($man!.flown!, true, 'flown', 'red'));
		}
		if (bi) {
			trs.push(...make_trace($man!.template!, true, 'template', 'blue'));
		}

		return trs;
	};

	let flown = true;
	let template = true;

	$: all_traces = make_traces(flown, template);
</script>

<div class="column">
	<Plot data={all_traces} layout={layout3d} fillParent={true}/>
</div>
<nav class="navbar fixed-bottom">
	<ul class="navbar-nav me-auto mb-2 mb-lg-0">
		<input id="Flown" type="checkbox" class="form-control-sm" bind:checked={flown} /><label
			for="Flown">Flown</label
		>
		<input id="intended" type="checkbox" class="form-control-sm" bind:checked={template} /><label
			for="intended">intended</label
		>
	</ul>
</nav>
