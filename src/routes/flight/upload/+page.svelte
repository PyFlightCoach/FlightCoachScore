<script lang="ts">
	import { bin, totalScore, analyses } from '$lib/stores/analysis';
	import { createAnalysisExport } from '$lib/analysis/analysis';
	import { get } from 'svelte/store';
	import { user } from '$lib/stores/user';
	import { dbServer } from '$lib/api';
  import {loading} from '$lib/stores/shared';
  import {goto} from '$app/navigation';
  import {base} from '$app/paths';

	let form_state: string | undefined;

	let schedule = get(analyses[0])!.schedule;

	const upload = async (e: Event) => {
    $loading=true;
		try {
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
			if (e.target?.include_bin!.checked && $bin) {
				form_data.append('files', $bin);
			}
			const r = await dbServer.post('flight', form_data);
      form_state = 'Upload Successful'
      goto(base + '/database/query/leaderboards')
		} catch {
			form_state = 'Oops...something has gone wrong. Please try again later.';
		}
    $loading=false;
	};
</script>

<form class="col-4" on:submit|preventDefault={upload}>
	{#if form_state}
		<div class="row mt-4">
			<p><mark>{form_state}</mark></p>
		</div>
	{/if}
	<h4 class="form-label">Flight Data Upload</h4>
	<p class="form-label">Bin File: {$bin?.name}</p>
	<p class="form-label">Category: {schedule.category}</p>
	<p class="form-label">Schedule: {schedule.name}</p>
	<p class="form-label">Total Score: {$totalScore}</p>
	<div class="form-check">
		<input id="include_bin" name="include_bin" class="form-check-input" type="checkbox" />
		<label class="form-check-label" for="include_bin">Include BIN File</label>
	</div>
	<div class="input-group">
		<label class="input-group-text" for="comments">Comments</label>
		<input id="comments" class="form-control" type="text" name="comments" />
	</div>
	{#if $user?.is_superuser}
		<div class="input-group">
			<span class="input-group-text">Additional controls for supeuser</span>
		</div>
	{/if}
	<button class="btn btn-primary" type="submit">Submit</button>
</form>
