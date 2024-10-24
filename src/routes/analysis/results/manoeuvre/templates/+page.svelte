<script lang="ts">
	import Plot from 'svelte-plotly.js';
	import { modeltrace, ribbon } from '$lib/components/plots/traces';
	import { layout3d } from '$lib/components/plots/layouts';
	import { analyses, selManID, fcj } from '$lib/stores/analysis';
	import type { States } from '$lib/analysis/state';
	import colddraft from '$lib/components/plots/colddraft.js';

	$: man = analyses[$selManID!];

	const make_trace = (tp: States, models: boolean, name: string, color: string) => {
		const trs = [ribbon(tp, 5, {}, { name, color })];

		if (models) {
			trs.push(...modeltrace(tp.downsample(20), colddraft, { name, color }));
		}
		return trs;
	};

	const make_traces = (bf: boolean, bi: boolean, bc: boolean) => {
		const trs = [];
		if (bf) {
			trs.push(...make_trace($man!.flown!, true, 'flown', 'red'));
		}
		if (bi) {
			trs.push(...make_trace($man!.template!, true, 'intended', 'blue'));
		}
		if (bc) {
			trs.push(...make_trace($man!.corrected_template!, true, 'corrected', 'green'));
		}
		return trs;
	};

	let flown = true;
	let intended = true;
	let corrected = true;

	$: all_traces = make_traces(flown, intended, corrected);
</script>

<div>
	<div style:height="100%">
		<Plot data={all_traces} layout={layout3d} fillParent={true} />
	</div>
	<nav class="navbar fixed-bottom navbar-dark bg-dark">
		<ul class="navbar-nav me-auto mb-2 mb-lg-0">
			<div class="input-group">
				<input id="Flown" type="checkbox" class="form-control-sm" bind:checked={flown}/><label for="Flown">Flown</label>
				<input id="intended" type="checkbox" class="form-control-sm" bind:checked={intended}/><label for="intended">intended</label>
				<input id="corrected" type="checkbox" class="form-control-sm" bind:checked={corrected}/><label for="corrected">corrected</label>
			</div>
		</ul>
	</nav>
</div>
