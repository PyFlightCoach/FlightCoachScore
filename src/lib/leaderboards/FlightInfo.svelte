<script lang="ts">
	import Plot from '$lib/plots/Plotly.svelte';
	import { user } from '$lib/stores/user.js';
	import { difficulty, truncate } from '$lib/leaderboards/stores';
	import * as types from '$lib/api/DBInterfaces/flight';
	import { Flight, loadInPlotter } from '$lib/database/flight';
	import { dbServer } from '$lib/api/api';
	import { resolve } from '$app/paths';
	import { loadAnalysisFromDB, loadAJson } from '$lib/flight/analysis';
	import { loading, activeFlight } from '$lib/stores/shared';
	import { goto } from '$app/navigation';
	import { windowWidth, blockProgress } from '$lib/stores/shared';
	import { saveAs } from 'file-saver';
	import JSZip from 'jszip';
	import { prettyPrintHttpError } from '$lib/utils/text';

	let { f = $bindable(), rank = $bindable() }: { f: Flight; rank: number | undefined } = $props();

	let selectedVersion = $state(Object.keys(f.meta.scores)[0]);
	const score: types.DBFlightScore = $derived(f.getScore($difficulty, $truncate, selectedVersion));

	let targetPrivacy = $state(f.meta.privacy);
	let newComment = $state(f.meta.comment);

	const isAnalysisLoaded = $derived(f.meta.flight_id == $activeFlight?.meta.flight_id);
	const canEdit = $derived(f.isMine || $user?.is_superuser);
	const canView = $derived(canEdit || types.privacyOptions.indexOf(f.meta.privacy) > 0);
	const canAnalyse = $derived(canEdit || types.privacyOptions.indexOf(f.meta.privacy) > 1);
</script>

<div class="row px-2 py-0 bg-light">
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
		<div class="input-group">
			<label class="input-group-text" for="set-privacy">Privacy</label>
			<select disabled={!canEdit} class="form-select" id="set-privacy" bind:value={targetPrivacy}>
				{#each types.privacyOptions as v}
					<option value={v}>{v.replace('_', ' ')}</option>
				{/each}
			</select>
		</div>

		<div class="input-group">
			<label class="input-group-text" for="set-comment">Comment</label>
			<textarea
				id="set-comment"
				class="form-control"
				rows="2"
				bind:value={newComment}
				disabled={!canEdit}
			></textarea>
		</div>

		{#if canEdit && (targetPrivacy != f.meta.privacy || newComment != f.meta.comment)}
			<div>
				<button
					class="btn btn-outline-primary w-100"
					onclick={() => {
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
					}}
					>Update
				</button>
			</div>
		{/if}
		<div class="input-group">
			<button
				class="form-control btn btn-outline-secondary {canView ? '' : 'disabled'}"
				data-sveltekit-preload-data="tap"
				onclick={() => {
					loadInPlotter(f.meta.flight_id);
				}}
			>
				View Flight
			</button>
			<button
				class="form-control btn btn-outline-secondary {canAnalyse ? '' : 'disabled'}"
				data-sveltekit-preload-data="tap"
				onclick={() => {
					loadAnalysisFromDB(f.meta.flight_id)
				}}
			>
				View Analysis
			</button>
			{#if $user?.is_superuser}
				<button
					class="form-control btn btn-outline-secondary"
					onclick={() => {
						loadAJson(f.meta.flight_id).then((res) => {
							const blob = new Blob([JSON.stringify(res.data)], { type: 'application/json' });
							saveAs(blob, `${f.meta.flight_id}.analysis.json`);
						});
					}}
				>
					Download AJson
				</button>
				<button
					class="form-control btn btn-outline-secondary"
					onclick={() => {
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
					class="form-control btn btn-outline-secondary {canView ? '' : 'disabled'}"
					data-sveltekit-preload-data="tap"
					onclick={() => {
						dbServer
							.post('flight/holding/copy/' + f.meta.flight_id)
							.then((res) => {
								console.log('Flight copied to holding, expiry:', res.data.detail);
								return dbServer.get('flight/holding/copy/fcj/' + res.data.id);
							})
							.then((res) => {
								const blob = new Blob([JSON.stringify(res.data)], { type: 'application/json' });
								saveAs(blob, `${f.meta.flight_id}.fc.json`);
							})
							.catch((err) => {
								console.error(err);
								alert('Failed to download json: ' + err.message);
							});
					}}
				>
					Download FCJ
				</button>

				<button
					class="form-control btn btn-outline-secondary"
					onclick={() => {
						if (confirm('Are you sure you want to delete this flight?')) {
							dbServer.delete(`flight/${f.meta.flight_id}`)
              .then(() => {
                $activeFlight = undefined;
              })
              .catch((err) => {
                alert('Failed to delete flight: ' + prettyPrintHttpError(err));
                throw err;
              })
							
						}
					}}
				>
					Delete
				</button>
			{/if}
		</div>
		<div class="list-group-item">
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
		</div>
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
