<script lang="ts">
	import { selManID, analyses } from '$lib/stores/analysis';
	import Plot from 'svelte-plotly.js';
	import { points, ribbon } from '$lib/components/plots/traces';
	import { layout3d } from '$lib/components/plots/layouts';
	import { iacBoxTrace, f3aBoxTrace } from '$lib/flight/box/box_geometry';
	import { d3Color } from '$lib/components/plots/styling';
  import {mean} from 'lodash';

	let man = analyses[$selManID!];

	let states = $derived($man!.flown!.split());

	let centre_points = $derived(
		$man!.mdef!.info.centre_points.map((i) => Object.values(states!)[i - 1].data.at(-1)!.pos)
	);

	let el_points = $derived(
		$man!.mdef!.info.centred_els.map((i) => {
			let el = Object.values(states)[i[0]].data;
			return el[Math.round(i[1] * el.length)].pos;
		})
	);

	let boxfunc = $derived(
		{ RectangularBox: iacBoxTrace, TriangularBox: f3aBoxTrace }[$man!.mdef!.box.Kind]!
	);

	let centredg = $derived(
		Object.values($man!.scores!.positioning.data).find((v) => v.name.includes('centre'))
	);
	let boxdgs = $derived(
		Object.values($man!.scores!.positioning.data).filter((v) => v.criteria.kind == 'Bounded')
	);

	let name: string | undefined = $state();

	let activeDg = $derived(boxdgs.find((dg) => dg.name == name));

	let mul = $derived(activeDg?.measurement.unit == 'rad' ? 180 / Math.PI : 1);
	let unit = $derived(activeDg?.measurement.unit == 'rad' ? 'deg' : activeDg?.measurement.unit);

	let outRegions = $derived.by(() => {
		return activeDg?.keys.map((k, i) => {
			const endIndex = k as number;
			const startIndex = activeDg.sample.slice(0, endIndex - 1).findLastIndex((v) => v == 0) + 1;
			const error = activeDg.errors[i] * mul;
			const proportion = (endIndex - startIndex) / activeDg.sample.length;
			const rawError = (mul * activeDg.errors[i]) / proportion;
	  const meanVis = mean(activeDg.measurement.visibility.slice(startIndex, endIndex))
			return {
				endIndex,
				startIndex,
				error,
				proportion,
				rawError,
        meanVis,
				sts: $man!.flown!.slice(startIndex, endIndex)
			};
		});
	});

  
  const cpNames = $derived($man!.mdef!.info.centre_points.map((i) => 'Point '.concat(i.toString())));
  const ceNames = $derived($man!.mdef!.info.centred_els.map((i) => 'Element '.concat(i[0].toString())));
</script>

<div class="col-md-4 bg-light border">
  <small>Box Downgrades</small>
	<div class="row pt-2 px-2">
		<label class="col col-form-label" for="criteriaTable">Select DG:</label>
		{#if name}
			<button
				class="col btn btn-sm btn-outline-secondary"
				onclick={() => {
					name = undefined;
				}}>Clear</button
			>
		{/if}
	</div>
	<div class="row pt-2">
		<div class="table-responsive">
			<table class="table border">
				<thead>
					<tr>
						<th></th>
						<th>Name</th>
						<th class="text-center">Downgrade</th>
					</tr>
				</thead>

				<tbody>
					{#each boxdgs as pos}
						{#if pos.dgs.length > 0}
							<tr>
								<td
									><input
										class="form-check-input"
										type="radio"
										name="manSelect"
										bind:group={name}
										value={pos.name}
									/></td
								>
								<td>{pos.name}</td>
								<td class="text-center">{pos.total.toFixed(2)}</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	{#if activeDg && outRegions}
		<div class="row pt-2">
			<div class="table-responsive">
				<table class="table border">
					<tbody>
						<tr
							><td class="fw-bold">Region</td>{#each outRegions || [] as reg, i}<td class="text-center" style="background-color: {d3Color(i)};">{i}</td>{/each}</tr
						>
						<tr
							><td class="fw-bold">Mean Error ({unit})</td>{#each outRegions || [] as reg, i}<td  class="text-center" 
									>{reg.rawError.toFixed(2)}</td
								>{/each}</tr
						>
						<tr
							><td class="fw-bold">Proportion</td>{#each outRegions || [] as reg, i}<td  class="text-center" 
									>{reg.proportion.toFixed(2)}</td
								>{/each}</tr
						>
						<tr
							><td class="fw-bold">Weighted ({unit})</td>{#each outRegions || [] as reg, i}<td class="text-center" 
									>{reg.error.toFixed(2)}</td
								>{/each}</tr
						>
            <tr>
              <td class="fw-bold">Mean Visibility</td>{#each outRegions || [] as reg, i}<td class="text-center" 
              >{reg.meanVis.toFixed(2)}</td
            >{/each}
            </tr>
						<tr
							><td class="fw-bold">DG</td>{#each outRegions || [] as reg, i}<td class="text-center" 
									>{activeDg.dgs[i].toFixed(2)}</td
								>{/each}</tr
						>
					</tbody>
				</table>
			</div>
		</div>
	{/if}

	{#if centredg}
		<hr class="mb-0"/>
		<small >Center Downgrades</small>

    <div class="row pt-2">
      <div class="table-responsive">
        <table class="table border">
          <tbody>
            <tr><td class="text-nowrap fw-bold">Location</td>{#each cpNames.concat(ceNames) as k}<td class="text-nowrap text-center">{k}</td>{/each}</tr>
            <tr><td class="text-nowrap fw-bold">Error (deg)</td>{#each centredg?.errors as err}<td class="text-center" >{(err * 180 / Math.PI).toFixed(2)}</td>{/each}</tr>
            <tr><td class="text-nowrap fw-bold">Visibility</td>{#each centredg?.sample_keys as k}<td class="text-center" >{centredg?.measurement.visibility[k as number].toFixed(2)}</td>{/each}</tr>
            <tr><td class="text-nowrap fw-bold">Downgrade</td>{#each centredg?.dgs as dg}<td class="text-center" >{dg.toFixed(2)}</td>{/each}</tr>
          </tbody>
        </table>
      </div>
    </div>

	{/if}
</div>

<div class="col-md-8 flex-grow-1 d-flex flex-column">
	<div class="row flex-grow-1" style="min-height:450px">
		<Plot
			data={[
				ribbon(
					$man!.flown!,
					5,
					{},
					activeDg ? { opacity: 0.2, showlegend: false, color: 'grey', name: 'base' } : {}
				),
				...(outRegions?.length
					? outRegions.map((r, i) =>
							ribbon(
								r.sts,
								5,
								{},
								{ opacity: 1, showlegend: false, color: d3Color(i), name: `out ${i}` }
							)
						)
					: []),
				...points(centre_points,cpNames),
				...points(el_points,ceNames),
				boxfunc()
			]}
			layout={layout3d}
			fillParent={true}
		/>
	</div>
</div>
