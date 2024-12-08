<script lang="ts">
	import { bin, totalScore, analyses } from '$lib/stores/analysis';
	import { activeFlight, isAnalysisModified } from '$lib/stores/shared';
	import { createAnalysisExport } from '$lib/analysis/analysis';
	import { get } from 'svelte/store';
	import { dbServer } from '$lib/api';
	import { loading } from '$lib/stores/shared';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { Flight } from '$lib/database/flight';
	import { privacyOptions } from '$lib/database/interfaces';
	import { user } from '$lib/stores/user';

	let form_state: string | undefined;

	let schedule = get(analyses[0])!.schedule;

  let comment: string | undefined= $activeFlight?.meta.comment || '';
  let privacy: string | undefined = $activeFlight?.meta.privacy || 'view_flown';
  let include_bin = true;

  $: isNew = $bin && !$activeFlight;
  $: isUpdated = $activeFlight?.meta.comment != comment || $activeFlight?.meta.privacy != privacy || $isAnalysisModified
  $: canI = isNew || $user?.is_superuser || $activeFlight?.isMine;


	const upload = async () => {
		$loading = true;

		form_state = 'Uploading...';
		const form_data = new FormData();
		form_data.append(
			'files',
			new File(
				[
					new Blob([JSON.stringify(await createAnalysisExport(true), null, 2)], {
						type: 'application/octet-stream'
					})
				],
				'analysis.ajson',
				{ type: 'application/octet-stream' }
			)
		);
    if (comment) form_data.append('comment', comment);
    if (privacy) form_data.append('privacy', privacy);
		if (include_bin && $bin) form_data.append('files', $bin);

		dbServer
			.post('flight', form_data)
			.then((r) => Flight.load(r.id))
			.then((f) => {
				activeFlight.set(f);
				form_state = 'Upload Successful';
        $bin = undefined;
				goto(base + '/database/query/leaderboards');
			})
			.catch((e) => {
				form_state = 'Upload Failed';
				console.error(e);
			}).finally(() => {
        $loading = false;
      });
	};
</script>

<form class="col-md-3 pt-5" on:submit|preventDefault={upload}>
	{#if form_state}
		<div class="row mt-4">
			<p><mark>{form_state}</mark></p>
		</div>
	{/if}
	
	<p class="form-label">Bin File: {$bin?.name}</p>
	<p class="form-label">Category: {schedule.category}</p>
	<p class="form-label">Schedule: {schedule.name}</p>
	<p class="form-label">Total Score: {$totalScore}</p>
  {#if !$activeFlight}
    <div class="form-check">
      <input id="include_bin" name="include_bin" class="form-check-input" type="checkbox" bind:checked={include_bin}/>
      <label class="form-check-label" for="include_bin">Include BIN File</label>
    </div>
  {/if}
	<li class="input-group">
    <label class="input-group-text" for="set-privacy">Privacy</label>
    <select
      class="form-select"
      id="set-privacy"
      bind:value={privacy}
    >
      {#each privacyOptions as v}
        <option value={v}>{v.replace('_', ' ')}</option>
      {/each}
    </select>
  </li>
  <div class="input-group">
		<label class="input-group-text" for="comments">Comment</label>
		<textarea id="comments" class="form-control" name="comments" rows="2"  bind:value={comment}></textarea>
	</div>
  {#if canI && (isNew || isUpdated)}
    <button class="btn btn-primary" type="submit" on:click={upload}>{isNew ? 'upload' : 'update'}</button>
  {/if}
</form>
