<script lang="ts">
	import { selManID, analyses } from '$lib/stores/analysis';
	import type { States } from '$lib/analysis/state';
	import Plot from 'svelte-plotly.js';
	import { coloured_ribbons, points } from '$lib/components/plots/traces';
	import { layout3d } from '$lib/components/plots/layouts';
	import { iacBoxTrace, f3aBoxTrace } from '$lib/components/box/box_geometry';

	$: man = analyses[$selManID!];

	$: states = $man!.flown!.split();

	const get_points = (states: Record<string, States>) => {
		return $man!.mdef!.info.centre_points.map((i) => {
			return Object.values(states!)[i - 1].data.at(-1)!.pos;
		});
	};

	const get_el_points = (states: Record<string, States>) => {
		return $man!.mdef!.info.centred_els.map((i) => {
			let el = Object.values(states)[i[0]].data;
			return el[Math.round(i[1] * el.length)].pos;
		});
	};

	$: centre_points = get_points(states);
	$: el_points = get_el_points(states);

	$: boxfunc = { RectangularBox: iacBoxTrace, TriangularBox: f3aBoxTrace }[$man!.mdef!.box.Kind]!;
</script>

<div class="col-4 justify-content-md-center border">
	<table class="table">
		<thead>
			<tr>
				<th>Name</th>
				<th>Values</th>
				<th>Visibility</th>
				<th>Downgrade</th>
			</tr>
		</thead>

		<tbody>
			{#each Object.values($man.scores.positioning.data) as pos}
				{#if pos.dgs.length > 0}
					<tr>
						<td>{pos.name}</td>
						<td>
							{pos.errors.map((e) =>
								(e * (pos.measurement.unit.includes('rad') ? 180 / Math.PI : 1)).toFixed(2)
							)}
							{pos.measurement.unit.replace('rad', 'deg')}
						</td>
						<td>
              
							{pos.keys.map(k=>pos.measurement.visibility[pos.sample_keys[k]].toFixed(2)).join(', ')}
						</td>
						<td>{pos.total.toFixed(2)}</td>
					</tr>
				{/if}
			{/each}
		</tbody>
	</table>
</div>

<div class="col-8 border">
	<Plot
		data={coloured_ribbons(states, 2)
			.concat(
				points(
					centre_points,
					$man.mdef.info.centre_points.map((i) => 'centre point '.concat(i.toString()))
				)
			)
			.concat(
				points(
					el_points,
					$man.mdef.info.centred_els.map((i) => 'centred el '.concat(i[0].toString()))
				)
			)
			.concat([boxfunc()])}
		layout={layout3d}
		fillParent={true}
	/>
</div>
