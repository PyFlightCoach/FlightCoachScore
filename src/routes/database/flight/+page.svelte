<script lang="ts">
	import PlotSec from '$lib/components/plots/PlotSec.svelte';
	export let data;

	let scores = data.flight!.getScore(3, false, '0.4.0');

	let version = Object.keys(data.flight!.meta.scores)[0];
	let activeManId = 0;
	let showBox = true;
</script>

<div class="col-2">
	{#if data.flight}
  <div class="form-group row">
		<label class="col col-form-label" for="version">FA Version</label>
		<select class=" form-select col" id="version" name="version" required bind:value={version}>
			{#each Object.keys(data.flight.meta.scores) as ver}
				<option value={ver}>{ver}</option>
			{/each}
		</select>
  </div>
    
  <div  class="form-check">
    <input class="form-check-input" type="checkbox" id="showBox" bind:checked={showBox} />
    <label class="input-check-label" for="showBox">Show Box</label>
  </div>

  
		<div class="row">
			<table class="table-sm">
				<thead>
					<tr>
						<th></th>
						<th>Manoeuvre</th>
						<th>k</th>
						<th>Score</th>
					</tr>
				</thead>
				<tbody>
					{#each data.flight.schedule.manoeuvres as man, i}
						<tr>
							<td
								><input
									class="radio"
									type="radio"
									name="manSelect"
									value={i}
									bind:group={activeManId}
								/></td
							>
							<td>{man.short_name}</td>
							<td>{man.k}</td>
							<td>{scores.manoeuvre_scores[i].toFixed(2)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
<div class="col-10">
	<PlotSec
		flst={data.mans[activeManId]}
		controls={['play', 'scale', 'speed', 'projection', 'modelClick']}
		bind:showBox
	/>
</div>
