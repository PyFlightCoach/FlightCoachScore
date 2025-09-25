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
		isCompFlight,
		schedule
	} from '$lib/stores/analysis';
	import {
		dataSource,
		activeFlight,
		isAnalysisModified,
		loading,
		unblockProgress,
		loadGuiLists,
		faVersion
	} from '$lib/stores/shared';
	import { uploadFlight } from '$lib/flight/analysis';
	import navBarContents from '$lib/stores/navBarContents';
	import AnalysisMenu from './ResultsMenu.svelte';
	import { privacyOptions } from '$lib/api/DBInterfaces/flight';
	import { createAnalysisExport, createScoreCSV } from '$lib/flight/analysis';
	import { user, checkUser } from '$lib/stores/user';
	import { Flight } from '$lib/database/flight';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { postUploadSearch } from '$lib/leaderboards/stores';
	import { saveAs } from 'file-saver';
	import Popup from '$lib/components/Popup.svelte';
	import { activeComp, setComp } from '$lib/stores/contests';
	import UploadForCompetitor from '$lib/competitions/competitors/UploadForCompetitor.svelte';
	import { ContestManager } from '$lib/competitions/compthings/ContestManager';
	import type { DBFlightMeta, FlightUploadResponse } from '$lib/api/DBInterfaces/flight';

	$navBarContents = AnalysisMenu;

	let userId = $derived($user?.id.replaceAll('-', ''));

	let form_state: string | undefined = $state();

	let comment: string | undefined = $state($activeFlight?.meta.comment || '');
	let privacy: string | undefined = $state($activeFlight?.meta.privacy || 'view_analysis');

	const isNew = $derived(($bin && !$activeFlight) || false);
	const isMine = $derived(
		(userId &&
			(userId == $activeFlight?.meta.pilot_id || userId == $activeFlight?.meta.contributor_id)) ||
			false
	);

	const isUpdated = $derived(
		$activeFlight?.meta.comment != comment ||
			$activeFlight?.meta.privacy != privacy ||
			$isAnalysisModified ||
			false
	);

	const canI = $derived($user?.is_verified && (isMine || isNew || $user?.is_superuser));

	let competition = $state(
		$activeComp?.checkCanUpload($schedule?.schedule_id) ? $activeComp : undefined
	);

	let showCompetitionForm = $state(false);
	let showResultsSelection: boolean = $state(false);
	let round: ContestManager | undefined = $state();
	let pilotId: string | undefined = $state();

	$inspect('pilotId:', pilotId, 'round:', round);

	const upload = async () => {
		checkUser(false, false, false)
			.then(() => {
				form_state = 'Uploading Analysis, this can take some time...';
				$loading = true;
				return uploadFlight(
					createAnalysisExport(true),
					isNew ? $bin : undefined,
					privacy,
					comment,
					$activeFlight?.meta.flight_id,
					pilotId,
					round?.summary.id
				);
			})
			.then((res) => res.data)
			.then((data: FlightUploadResponse) => {
				if (data.meta) {
					$activeFlight = new Flight(data.meta, $schedule);
				} else {
					Flight.load(data.id).then((f) => {
						$activeFlight = f;
					});
				}

				form_state = 'Upload Successful';
				if (data.compthing) {
					setComp(new ContestManager(data.compthing));
					goto(resolve(`/competition/view`));
				} else {
					postUploadSearch();
					goto(resolve('/database/query/leaderboards'));
				}
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
	};
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
		<button
			id="showResSel"
			class="btn btn-outline-secondary w-100"
			onclick={() => {
				showResultsSelection = !showResultsSelection;
			}}
		>
			{$faVersion}, {['Easy', 'Medium', 'Hard'][$difficulty - 1]}{#if $truncate}, T{/if}
			<i class="bi {showResultsSelection ? 'bi-chevron-up' : 'bi-chevron-down'}"></i>
		</button>
	</div>
	{#if showResultsSelection}
		<div class="container border rounded mb-2">
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
		</div>
	{/if}

	{#if canI && $isComplete && (isNew || isUpdated) && $isCompFlight && $dataSource == 'bin'}
		<div class="container-auto border rounded p-2 mb-2">
			<UploadForCompetitor
				bind:competition
				bind:pilotID={pilotId}
				bind:round
				schedule={$schedule}
			/>
		</div>
	{/if}

	<div class="container-auto border rounded p-2">
		{#if canI && $isComplete && (isNew || isUpdated) && $isCompFlight && ($dataSource == 'bin' || $dataSource == 'db')}
			<div class="row p-2">
				<label class="col-auto col-form-label" for="set-privacy">Privacy</label>
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

			<div class="row mb-2 px-2">
				<button class="col btn btn-primary mx-2" type="submit" onclick={upload}
					>{isNew ? 'Upload' : 'Update'}
				</button>
			</div>
		{/if}

		<div class="row mb-2 px-2">
			{#if $dataSource != 'bin' && $dataSource != 'db'}
				<span>You can only upload original flights loaded from a .bin file</span>
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
	<div class="container border rounded d-none">
		{#if $isComplete && $isCompFlight && $user?.is_verified}
			<div class="row p-2">
				<button
					class="col btn btn-outline-secondary px-2"
					type="submit"
					onclick={() => {
						saveAs(createScoreCSV(), 'score.csv');
					}}>Download Score CSV</button
				>
			</div>
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

<Popup bind:show={showCompetitionForm}>Competition Selection</Popup>
