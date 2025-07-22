<script lang="ts">
	import Plot from '$lib/plots/Plotly.svelte';
	import { user } from '$lib/stores/user.js';
	import { difficulty, truncate } from '$lib/leaderboards/stores';
	import * as types from '$lib/flight/db';
	import { Flight } from '$lib/database/flight';
	import { dbServer } from '$lib/api/api';
	import { base } from '$app/paths';
	import { loadAnalysisFromDB, loadAJson } from '$lib/flight/analysis';
	import { manNames } from '$lib/stores/analysis';
	import { loading, activeFlight } from '$lib/stores/shared';
	import { goto } from '$app/navigation';
	import { windowWidth, blockProgress } from '$lib/stores/shared';
	import { saveAs } from 'file-saver';
	import JSZip from 'jszip';

	export let f: Flight;
	export let rank: number | undefined;

	let selectedVersion = Object.keys(f.meta.scores)[0];
	let score: types.DBFlightScore;
	$: score = f.getScore($difficulty, $truncate, selectedVersion);

	let targetPrivacy = f.meta.privacy;
	$: newComment = f.meta.comment;

	$: isAnalysisLoaded = f.meta.flight_id == $activeFlight?.meta.flight_id;

	$: canEdit = $user?.id.replaceAll('-', '') == f.meta.pilot_id || $user?.is_superuser;
	$: canView = canEdit || types.privacyOptions.indexOf(f.meta.privacy) > 0;
	$: canAnalyse = canEdit || types.privacyOptions.indexOf(f.meta.privacy) > 1;

	const patchMeta = () => {
		const fd = new FormData();
		fd.append('privacy', targetPrivacy);
		fd.append('comment', newComment);
		dbServer.patch(`flight/${f.meta.flight_id}`, fd).then(() => {
			dbServer.get(`flight/${f.meta.flight_id}`).then((res) => {
				f = new Flight(res.data, f.schedule);
				targetPrivacy = f.meta.privacy;
				newComment = f.meta.comment;
			});
		});
	};
</script>

<div class="row px-2 py-0">
	{#if $windowWidth >= 768}
		<div class="col-md-4 py-0 px-1" style="max-height:300px;">
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
			/>
		</div>
	{/if}
	<div class="col-6 col-md-4 overflow-auto py-0 px-1" style="max-height:300px;">
		<ul class="list-group">
			<li class="input-group">
				<label class="input-group-text" for="set-privacy">Privacy</label>
				<select disabled={!canEdit} class="form-select" id="set-privacy" bind:value={targetPrivacy}>
					{#each types.privacyOptions as v}
						<option value={v}>{v.replace('_', ' ')}</option>
					{/each}
				</select>
			</li>

			<li class="input-group">
				<label class="input-group-text" for="set-comment">Comment</label>
				<textarea
					id="set-comment"
					class="form-control"
					rows="2"
					bind:value={newComment}
					disabled={!canEdit}
				></textarea>
			</li>

			{#if canEdit && (targetPrivacy != f.meta.privacy || newComment != f.meta.comment)}
				<li>
					<button class="btn btn-outline-secondary w-100" on:click={patchMeta}>Update </button>
				</li>
			{/if}
			<li class="input-group">
				<button
					class="form-control btn btn-outline-secondary {canView ? '' : 'disabled'}"
					data-sveltekit-preload-data="tap"
					on:click={() => {
						dbServer
							.post('flight/holding/copy/' + f.meta.flight_id)
							.then((res) => {
                console.log("Flight copied to holding, expiry:", res.data.detail)
								window.open(
									'https://www.flightcoach.org/ribbon3/plotter.html?token=' + res.data.id,
									'_blank'
								);
							})
							.catch((err) => {
								console.error(err);
								if (confirm('cant quite do this yet, open the plotter anyway?')) {
									window.open(
										'https://www.flightcoach.org/ribbon3/plotter.html?token=12345',
										'_blank'
									);
								}
							});
					}}
				>
					View Flight
				</button>
				<button
					class="form-control btn btn-outline-secondary {canAnalyse ? '' : 'disabled'}"
					data-sveltekit-preload-data="tap"
					on:click={() => {
						if (isAnalysisLoaded) {
							goto(base + '/flight/results');
						} else if (!$manNames || confirm('This will clear the current analysis. Continue?')) {
							loadAnalysisFromDB(f.meta.flight_id);
						}
					}}
				>
					View Analysis
				</button>
				{#if $user?.is_superuser}
					<button
						class="form-control btn btn-outline-secondary"
						on:click={() => {
              loadAJson(f.meta.flight_id)
                .then(res=>{
                  const blob = new Blob([JSON.stringify(res.data)], { type: 'application/json' });
                  saveAs(blob, `${f.meta.flight_id}.analysis.json`);
                })

						}}
					>
						Download AJson
					</button>
					<button
						class="form-control btn btn-outline-secondary"
						on:click={() => {
							const zip = new JSZip();
							dbServer
								.get(`flight/bin/${f.meta.flight_id}`, {
									responseType: 'blob',
									...blockProgress('Loading BIN from Database')
								})
								.then((res) => {
									saveAs(res.data, `${f.meta.flight_id}.zip`);
								});
						}}
					>
						Download BIN
					</button>
					<button
						class="form-control btn btn-outline-secondary"
						on:click={() => {
							if (confirm('Are you sure you want to delete this flight?')) {
								dbServer.delete(`flight/${f.meta.flight_id}`);
								$activeFlight = undefined;
							}
						}}
					>
						Delete
					</button>
				{/if}
			</li>
			<li class="list-group-item">
				<div class="container-fluid">
					<div class="row">
						<div class="col">
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
						</div>
						{#if rank}
							<div class="col align-content-center border rounded">
								<small>Overall Ranking</small>
								<h4>{rank}</h4>
							</div>
						{/if}
					</div>
				</div>
			</li>
		</ul>
	</div>
	<div class="col-6 col-md-4 overflow-auto py-0 px-1" style="max-height:300px;">
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
