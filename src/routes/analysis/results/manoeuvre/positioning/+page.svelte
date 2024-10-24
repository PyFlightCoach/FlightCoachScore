<script lang="ts">
	import { selManID, analyses } from '$lib/stores/analysis';
	import type { States } from '$lib/analysis/state';
	import Plot from 'svelte-plotly.js';
	import { coloured_ribbons, points } from '$lib/components/plots/traces';
	import { layout3d } from '$lib/components/plots/layouts';
	import { iacBoxTrace, f3aBoxTrace } from '$lib/analysis/box_geometry';

	$: man = analyses[$selManID!];

	$: states = $man?.flown.split();

	const get_points = (states: Record<string, States>) => {
		return $man!.mdef.info.centre_points.map((i) => {
			return Object.values(states)[i - 1].data.at(-1).pos;
		});
	};

	const get_el_points = (states: Record<string, States>) => {
		return $man!.mdef.info.centred_els.map((i) => {
			let el = Object.values(states)[i[0]].data;
			return el[Math.round(i[1] * el.length)].pos;
		});
	};

  let centre_points;
	let el_points;
  $: if (states) {
    centre_points = get_points(states);
    el_points = get_el_points(states);
  };
  let boxfunc;
  $: if ($man) {boxfunc = {'RectangularBox': iacBoxTrace, 'TriangularBox': f3aBoxTrace}[$man.mdef.box.Kind]};

</script>

{#if states}

  <div id="parent">
    <div id="table">
      <div class="cell head">Name</div>
      <div class="cell head">Weighted Mean Error</div>
      <div class="cell head">Mean Visibility</div>
      <div class="cell head">Downgrade</div>

      {#each Object.values($man.scores.positioning.data) as pos}
        {#if pos.dgs.length > 0}
          <div class="cell">{pos.name}</div>
          <div class="cell">
            {pos.errors.map((e) =>
              (e * (pos.measurement.unit.includes('rad') ? 180 / Math.PI : 1)).toFixed(2)
            )}
            {pos.measurement.unit.replace('rad', 'deg')}
          </div>
          <div class="cell">
            {'visibility' in pos.measurement ? pos.measurement.visibility[0].toFixed(2) : 1}
          </div>
          <div class="cell">{pos.total.toFixed(2)}</div>
        {/if}
      {/each}
    </div>
    <div>
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
  </div>
{:else}
<div>No data</div>
{/if}
