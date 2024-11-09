<script lang="ts">
	import { analysisServer } from '$lib/api';
	import {
		categories,
		schedules,
		manoeuvres,
		loadCategories,
		loadSchedules,
    loadManoeuvres,
	} from '$lib/stores/analysis';
	import { onMount } from 'svelte';
	let form_state: string | undefined;

	let category: string | undefined = undefined;
	let schedule: string | undefined = undefined;

	$: category ? loadSchedules(category) : undefined;

  $: schedule && category != 'New' ? loadManoeuvres(category, schedule) : undefined;

	const createManoeuvre = (name: string, schedule: string, category: string) => {
		analysisServer.post('create_mdef', { name, schedule, category });
	};

	const createMans = () => {};
	onMount(async () => {
		loadCategories();
	});
</script>

<div class="col-4">
	<form class="row" on:submit|preventDefault={createMans}>
		{#if form_state}
			<div class="row mt-4">
				<p><mark>{form_state}</mark></p>
			</div>
		{/if}

		<h4 class="form-label">Schedule Creation</h4>

		<div class="input-group">
			<label class="input-group-text" for="select_category">Select Category</label>
			<select
				class="form-select form-input"
				id="select_category"
				aria-label="select_category"
				bind:value={category}
			>
				{#each $categories as cat}
					<option value={cat}>{cat}</option>
				{/each}
			</select>
		</div>
		{#if category}
			<div class="input-group">
				<label class="input-group-text" for="select_category">Select Schedule</label>
				<select
					class="form-select form-input"
					id="select_category"
					aria-label="select_category"
					bind:value={schedule}
				>
					{#each $schedules[category] as sch}
						<option value={sch}>{sch}</option>
					{/each}
					<option value="New">New</option>
				</select>
			</div>
		{/if}


    {#if schedule == 'New'}
		Tools to Create A Schedule
	{:else if schedule}
		<table class="table table-sm table-hover table-bordered border-primary">
      <thead>
        <tr>
          <th>Short Name</th>
          <th>K</th>
          <th>DB Version</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {#each $manoeuvres[`${category}_${schedule}`] as man}
          <tr>
            <td>{man.name}</td>
            <td>{man.k}</td>
          </tr>
        {/each}
      </tbody>

    </table>
	{/if}

		<button class="btn btn-primary" type="submit">Submit</button>
	</form>

</div>
