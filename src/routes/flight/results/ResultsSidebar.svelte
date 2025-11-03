<script lang="ts">
	import {
		selectedResult,
		fa_versions,
		isComplete,
		difficulty,
		truncate,
		isCompFlight,
		schedule
	} from '$lib/stores/analysis';
	import {
		activeFlight,
		isAnalysisModified,
		loading,
		unblockProgress,
		loadGuiLists
	} from '$lib/stores/shared';
	import { privacyOptions } from '$lib/api/DBInterfaces/flight';
	import { createAnalysisExport } from '$lib/flight/analysis';
	import { user, checkUser } from '$lib/stores/user';
	import { DBFlight } from '$lib/database/flight';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { postUploadSearch } from '$lib/leaderboards/stores';
	import Popup from '$lib/components/Popup.svelte';
	import { activeComp } from '$lib/stores/contests';
	import UploadForCompetitor from '$lib/competitions/competitors/UploadForCompetitor.svelte';
	import { ContestManager } from '$lib/competitions/compthings/ContestManager';
	import { prettyPrintHttpError } from '$lib/utils/text';
	import UploadForOtherPilot from './UploadForOtherPilot.svelte';

	let comment: string | undefined = $state($activeFlight?.source.db?.meta.comment || '');
	let privacy: string | undefined = $state(
		$activeFlight?.source.db?.meta.privacy || 'view_analysis'
	);

	const isNew = $derived($activeFlight?.source.file);

	const isUpdated = $derived(
		$activeFlight?.source.db?.meta.comment != comment ||
			$activeFlight?.source.db?.meta.privacy != privacy ||
			$isAnalysisModified ||
			false
	);

	const canI = $derived(
		$user?.is_verified && ($activeFlight?.source.db?.isMine || isNew || $user?.is_superuser)
	);

	let competition = $state(
		$activeComp?.checkCanUpload(
			$activeFlight?.source.bootTime,
			new Date(),
			$user?.id,
			$schedule?.schedule_id
		)
			? $activeComp
			: undefined
	);

	let pilotId: string | undefined = $state();
	let showCompetitionForm = $state(false);
	let showResultsSelection: boolean = $state(false);
	let round: ContestManager | undefined = $state();

	const upload = async () => {
		$loading = true;
		const ajson = createAnalysisExport(true);
		checkUser(false, false, false)
			.then(() => {
        return $activeFlight!.upload(
          ajson,
          privacy,
          comment,
          pilotId || (round ? $user?.id : undefined),
          round?.summary.id
        );
			})
			.then(async (res) => {
        $activeFlight = res!.flight;
				$isAnalysisModified = false;
				
				if (res.compthing) {
					goto(resolve(`/competition/view`) + `/?id=${res.compthing.id}`);
				} else {
					postUploadSearch();
					goto(resolve('/database/leaderboards'));
				}
			})
			.catch((e) => {
				alert(prettyPrintHttpError(e));
			})
			.then(loadGuiLists)
			.finally(() => {
				$loading = false;
				unblockProgress();
			});
	};
</script>

<div class="row p-2" style="max-width:450px">
	<span>
		{#if $selectedResult}
			Showing results for
			{#if $activeFlight?.source.kind == 'example'}
				the example flight.
			{:else if $activeFlight?.source.kind == 'db'}
				a flight by {$activeFlight?.source.db?.meta.name}, loaded from the db.
			{:else}
				your flight imported from a {$activeFlight?.source.kind} file.
			{/if}
		{:else if $fa_versions.length == 0}
			Run some analyses to view result
		{/if}
	</span>

	<span> Boot time: {$activeFlight?.source.bootTime?.toISOString()}. </span>
</div>
{#if $fa_versions.length}
	<div class="row p-2">
		<button
			id="showResSel"
			class="btn btn-outline-secondary w-100"
			onclick={() => {
				showResultsSelection = !showResultsSelection;
			}}
		>
			{$selectedResult}, {['Easy', 'Medium', 'Hard'][$difficulty - 1]}{#if $truncate}, T{/if}
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
{/if}
{#if canI && $isComplete && isNew && $isCompFlight}
	<div class="container-auto border rounded p-2 mb-2">
		<UploadForCompetitor
			bind:competition
			bind:pilotID={pilotId}
			bind:round
			schedule={$schedule}
			bootTime={$activeFlight?.source.bootTime}
		/>
	</div>
	{#if !round && $user?.is_superuser}
		<UploadForOtherPilot bind:pilotID={pilotId} />
	{/if}
{/if}

<div class="container-auto border rounded p-2">
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

	{#if canI && $isComplete && (isNew || isUpdated) && $isCompFlight && (!round || pilotId)}
		<div class="row mb-2 px-2">
			<button
				class="col btn btn-primary mx-2"
				type="submit"
				onclick={upload}
				disabled={$loading}
				data-bs-dismiss="offcanvas"
				>{isNew ? 'Upload' : 'Update'}
			</button>
		</div>

    {:else}
	<div class="row mb-2 px-2">
		{#if !$activeFlight?.source.file || !$activeFlight?.source.db}
			<span>You can only upload original flights loaded from an Ardupilot BIN file or from Acrowrx</span>
		{:else if !$isCompFlight}
			<span>Only complete flights can be uploaded</span>
		{:else if !canI}
			{#if !$user}
				<span>Log in to upload</span>
			{:else if !$user.is_verified}
				<span>Verify your email to upload</span>
			{:else if !($activeFlight?.source.db?.isMine) || !isNew}
				<span>Only the pilot or contributor can edit a flight record</span>
			{/if}
		{:else if !(isNew || isUpdated)}
			{#if isNew && !isUpdated}
				<span>No change from stored analysis</span>
			{/if}
			<span>Nothing to update</span>
		{:else if !$isComplete}
			<span>Run all analyses for the latest analysis version before uploading</span>
		{:else if round && !pilotId}
			<span>Either select a pilot or dont select a competition</span>
		{/if}
	</div>
  	{/if}
</div>

<Popup bind:show={showCompetitionForm}>Competition Selection</Popup>
