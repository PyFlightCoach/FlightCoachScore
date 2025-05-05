<script lang="ts">
	import AnalysisSummary from './AnalysisSummary.svelte';
	import {
		totalScore,
		bin,
		selectedResult,
		fa_versions,
		bootTime,
		isComplete,
		difficulty,
		truncate,
    isCompFlight
	} from '$lib/stores/analysis';
	import {
		dataSource,
		activeFlight,
		isAnalysisModified,
		loading,
		blockProgress,
		unblockProgress,

		loadGuiLists

	} from '$lib/stores/shared';
	import navBarContents from '$lib/stores/navBarContents';
	import AnalysisMenu from './ResultsMenu.svelte';
	import { privacyOptions } from '$lib/flight/db';
	import { createAnalysisExport, createScoreCSV } from '$lib/flight/analysis';
	import { user, checkUser } from '$lib/stores/user';
	import { dbServer } from '$lib/api/api';
	import { Flight } from '$lib/database/flight';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { postUploadSearch } from '$lib/leaderboards/stores';
	import { saveAs } from 'file-saver';

	$navBarContents = AnalysisMenu;

  $: console.log("Is Comp Flight?", $isCompFlight);

	$: userId = $user?.id.replaceAll('-', '');

	let form_state: string | undefined;

	let comment: string | undefined = $activeFlight?.meta.comment || '';
	let privacy: string | undefined = $activeFlight?.meta.privacy || 'view_analysis';
	let include_bin = true;

	$: isNew = $bin && !$activeFlight;
	$: isMine =
		userId &&
		(userId == $activeFlight?.meta.pilot_id || userId == $activeFlight?.meta.contributor_id);

	$: isUpdated =
		$activeFlight?.meta.comment != comment ||
		$activeFlight?.meta.privacy != privacy ||
		$isAnalysisModified;
	$: canI = $user?.is_verified && (isMine || isNew || $user?.is_superuser);

	const upload = async () => {
		const form_data = new FormData();

    const ajson = new File(
				[
					new Blob([JSON.stringify(await createAnalysisExport(true), null, 2)], {
						type: 'application/octet-stream'
					})
				],
				'analysis.ajson',
				{ type: 'application/octet-stream' }
			)

		
		if (comment) form_data.append('comment', comment);
		if (privacy) form_data.append('privacy', privacy);
		
		if (await checkUser()) {
			form_state = 'Uploading Analysis, this can take some time...';
			$loading = true;

			(async () => {
				if (!$activeFlight) {
          form_data.append('files', ajson);
          if (include_bin && $bin && isNew) form_data.append('files', $bin);

					return await dbServer.post(
						'flight',
						form_data,
						blockProgress('Uploading Analysis to Database', 'upload')
					);
				} else {
          if (isUpdated) form_data.append('files',ajson);
					return await dbServer.patch(
						`flight/${$activeFlight.meta.flight_id}`,
						form_data,
						blockProgress('Uploading Analysis to Database', 'upload')
					);
				}
			})()
        .then((r) => Flight.load(r.data.id))
        .then((f) => {
					activeFlight.set(f);
					postUploadSearch();
					form_state = 'Upload Successful';
					$bin = undefined;
          goto(base + '/database/query/leaderboards');
				})
        .then(loadGuiLists)
        .catch((e) => {
					form_state = 'Upload Failed: ' + e.response?.data?.detail?.detail || e.message;
					console.error(e);
				})
				.finally(() => {
					$loading = false;
					unblockProgress();
				});
		} else {
			form_state = undefined;
		}
	};
  $: console.log($isComplete);
</script>

<div class="col-lg-4 bg-light border pt-3">
	{#if form_state}
		<div class="row mt-4">
			<p><mark>{form_state}</mark></p>
		</div>
	{/if}

	<div class="row p-2" style="max-width:450px">
		<span>
			{#if $selectedResult}
				Showing results for
				{#if $dataSource == 'example'}
					the example flight.
				{:else if $dataSource == 'db'}
					a flight by {$activeFlight?.meta.name}, loaded from the db.
				{:else}
					your flight imported from a {$dataSource} file.
				{/if}
			{:else if $fa_versions.length == 0}
				Run some analyses to view result
			{/if}
		</span>
		{#if $dataSource == 'bin'}
			<span> Boot time: {$bootTime || $activeFlight?.meta.date}. </span>
		{/if}
	</div>

	<div class="row p-2">
		<label for="version" class="col col-form-label text-nowrap">Analysis Version</label>
		<select id="version" class="col form-select text-center" bind:value={$selectedResult}>
			{#each $fa_versions as version}
				<option value={version}>
					{version}
				</option>
			{/each}
		</select>
	</div>

	<div class="row p-2">
		<label class="col col-form-label" for="difficulty">Difficulty</label>
		<select
			id="difficulty"
			class="col form-select text-center"
			name="difficulty"
			required
			bind:value={$difficulty}
		>
			<option value={3}>Hard</option>
			<option value={2}>Moderate</option>
			<option value={1}>Easy</option>
		</select>
	</div>

	<div class="form-check pt-2 px-4" title="Truncate individual downgrades before adding up">
		<input
			type="checkbox"
			class="form-check-input"
			id="truncate"
			name="truncate"
			bind:checked={$truncate}
		/>
		<label for="truncate">Truncate</label>
	</div>

	<hr />

	<div class="row p-2">
		<label class="col col-form-label" for="set-privacy">Privacy</label>
		<select class="col form-select" disabled={!canI} id="set-privacy" bind:value={privacy}>
			{#each privacyOptions as v}
				<option value={v}>{v.replace('_', ' ')}</option>
			{/each}
		</select>
	</div>
	<div class="row p-2">
		<label class="form-label" for="comments">Comments</label>
		<textarea
			id="comments"
			class="pt-0 form-control"
			disabled={!canI}
			name="comments"
			rows="3"
			bind:value={comment}
		></textarea>
	</div>

	<div class="row mb-2">
    {#if $isComplete && $isCompFlight && $user?.is_verified}
      
        <button class="col btn btn-outline-secondary px-2" type="submit" on:click={()=>{
          saveAs(createScoreCSV(), 'score.csv');
        }}
          >Download Score CSV</button
        >
      
    
    {/if}
		{#if canI && $isComplete && (isNew || isUpdated) && $isCompFlight}
			
				<button class="col btn btn-primary px-2" type="submit" on:click={upload}
					>{isNew ? 'Upload' : 'Update'}</button
				>
			
    {:else if !$isCompFlight}
      <span>Only complete flights can be uploaded</span>
		{:else if !canI}
			{#if !$user}
				<span>Log in to upload</span>
			{:else if !$user.is_verified}
				<span>Verify your email to upload</span>
			{:else if !isMine || !isNew}
				<span>Only the pilot or contributor can edit a flight record</span>
			{/if}
		{:else if !(isNew || isUpdated)}
			{#if isNew && !isUpdated}
				<span>No change from stored analysis</span>
			{/if}
			<span>Nothing to update</span>
		{:else if !$isComplete}
			<span>Run all analyses for the latest analysis version before uploading</span>
		{/if}
	</div>
</div>

<div class="col-lg-8 align-self pt-3">
	<div class="row px-md-5">
		<div class="col-auto">
			<AnalysisSummary />
		</div>

		<h2>Total Score = {$totalScore}</h2>
	</div>
</div>
