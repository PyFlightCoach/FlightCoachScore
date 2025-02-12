<script lang="ts">
	import PlotSec from '$lib/plots/PlotSec.svelte';
  import {getScale} from '$lib/schedule/schedule_handler.svelte'
	const { data } = $props();

  let version = $state(Object.keys(data.flight!.meta.scores)[0]);
	let scores = $derived(data.flight!.getScore(3, false, version));	
	let activeManId = $state(0);
	let showBox = $state(true);
  let i: number=$state(0);
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
		controls={['play', 'scale', 'speed', 'projection', 'modelClick', 'showBox']}
    fixRange
    includeZero={true} expand={50}
    scale={data.flight? getScale(data.flight?.schedule.rule_name): 1}
	/>
</div>
