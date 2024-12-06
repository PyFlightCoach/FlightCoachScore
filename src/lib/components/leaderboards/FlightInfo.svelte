<script lang="ts">
	import Plot from 'svelte-plotly.js';
	import { user } from '$lib/stores/user.js';
	import { difficulty, truncate } from '$lib/stores/leaderboards';
	import { type DBFlightScore, privacyOptions } from '$lib/database/interfaces';
	import { Flight } from '$lib/database/flight';
	import { dbServer } from '$lib/api';

	export let f: Flight;

	let selectedVersion = Object.keys(f.meta.scores)[0];
	let score: DBFlightScore;
	$: score = f.getScore($difficulty, $truncate, selectedVersion);

	let targetPrivacy = f.meta.privacy;
	let newComment = f.meta.comment;

	const patchMeta = () => {
		const fd = new FormData();
		fd.append('privacy', targetPrivacy);
		fd.append('comment', newComment);
		dbServer.patch(`flight/${f.meta.flight_id}`, fd).then((res) => {
			dbServer.get(`flight/${f.meta.flight_id}`).then((res) => {
				f = new Flight(res, f.schedule);
        targetPrivacy = f.meta.privacy;
        newComment = f.meta.comment;
			});
		});
	};
</script>

<div class="container bg-light">
	<div class="row bg-light" style="height:300px;">
		<div class="col h-100">
			<Plot
				data={[
					{
						lat: [f.meta.origin_lat],
						lon: [f.meta.origin_lng],
						type: 'scattermap',
						mode: 'markers',
						marker: { size: 10, color: 'red' },
						showlegend: false
					}
				]}
				layout={{
					map: {
						bearing: 0,
						center: { lat: f.meta.origin_lat, lon: f.meta.origin_lng },
						pitch: 0,
						zoom: 4
					},
					margin: { l: 0, r: 0, t: 0, b: 0 }
				}}
				fillParent={true}
			/>
		</div>
		<div class="col h-100 overflow-scroll">
			<ul class="list-group">
				<li class="input-group">
					<label class="input-group-text" for="set-privacy">Privacy</label>
					<select
						disabled={$user?.id.replaceAll('-', '') != f.meta.pilot_id}
						class="form-select"
						id="set-privacy"
						bind:value={targetPrivacy}
					>
						{#each privacyOptions as v}
							<option value={v}>{v.replace('_', ' ')}</option>
						{/each}
					</select>
				</li>

				<li class="input-group">
					<label class="input-group-text" for="set-comment">Comment</label>
					<textarea id="set-comment" class="form-control" rows="2" bind:value={newComment}
					></textarea>
				</li>

				{#if $user?.id.replaceAll('-', '') == f.meta.pilot_id && (targetPrivacy != f.meta.privacy || newComment != f.meta.comment)}
					<li>
						<button class="btn btn-outline-secondary w-100" on:click={patchMeta}> Update </button>
					</li>
				{/if}
				<li class="list-group-item text-start">Difficulty: {$difficulty}</li>
				<li class="list-group-item text-start">Truncate DGS: {$truncate}</li>
				<li class="list-group-item">
					<table class="table-sm table-responsive">
						<thead>
							<tr>
								<th></th>
								<th>Version</th>
								<th>Score</th>
							</tr>
						</thead>
						<tbody>
							{#each Object.keys(f.meta.scores) as version}
								<tr>
									<td
										><input
											class="radio"
											type="radio"
											name="manSelect"
											value={version}
											bind:group={selectedVersion}
										/></td
									>
									<td>{version}</td>
									<td>{f.getScore($difficulty, $truncate, version).score.toFixed(2)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</li>
			</ul>
		</div>
		<div class="col h-100 overflow-scroll">
			<table class="table table-sm table-responsive">
				<thead>
					<tr>
						<th>Manoeuvre</th>
						<th>K Factor</th>
						<th>Score</th>
					</tr>
				</thead>
				<tbody>
					{#each f.schedule.manoeuvres as man, i}
						<tr>
							<td>{man.name}</td>
							<td>{man.k}</td>
							<td>{score.manoeuvre_scores[i].toFixed(2)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
