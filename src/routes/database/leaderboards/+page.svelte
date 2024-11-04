<script lang="ts">
	import { dbServer } from '$lib/api.js';
  import {get_analysis_table} from '$lib/database.js';

	export let data;
	console.log(data.schedules);
	console.log(data.fa_versions);

	let n_days_val = 60;
	let col_heads = ['Position', 'Rank', 'Name', 'Country', 'Date', 'Score'];
	let table_rows: {
		table_rank: number;
		rank: number;
		name: string;
		country: string;
		date: Date;
		score: number;
	}[] = [];

	// Manipulate the number of days slider to make it nonlinear,
	// jumping to 720 days then 10000 days when > 360 is selected.
	function _update_n_days(my_ev) {
		n_days_val =
			my_ev.srcElement.value == 370
				? 720
				: my_ev.srcElement.value == 380
					? 10000
					: my_ev.srcElement.value;
	}

	// Convert the form data to query parameters, make the backend request
	// and update the table.
	async function _handleSubmit(event) {
		const f_data = new FormData(event.currentTarget);
		f_data.set('n_days', n_days_val);
		if (f_data.get('manoeuvre_ind') == '') f_data.delete('manoeuvre_ind');
		table_rows = await get_analysis_table(f_data);
	}
</script>

<div class="container-xl">
	<div class="row mt-4">
		<div class="col-3 bg-light">
			<form method="POST" on:submit|preventDefault={_handleSubmit}>
				<div class="mt-2 mb-3">
					<input type="checkbox" class="form-check-input" id="me_only_flag" name="me_only_flag" />
					<label for="me_only_flag">Only my flights</label>
				</div>
				<div class="mb-3">
					<input
						type="checkbox"
						class="form-check-input"
						id="one_per_pilot_flag"
						name="one_per_pilot_flag"
						checked
					/>
					<label for="one_per_pilot_flag">Only best flight for each pilot</label>
				</div>
				<div class="mb-3">
					<label for="schedule">Schedule</label>
					<select class="form-select" id="schedule" name="schedule" required>
						{#each data.schedules as sched}
							<option value={sched}>{sched}</option>
						{/each}
					</select>
				</div>
				<div class="mb-3">
					<label for="difficulty">Difficulty</label>
					<select class="form-select" id="difficulty" name="difficulty" required>
						<option value="3">Hard</option>
						<option value="2">Moderate</option>
						<option value="1">Easy</option>
					</select>
				</div>
				<div class="mb-3">
					<label for="fa_version">FA Version</label>
					<select class="form-select" id="fa_version" name="fa_version" required>
						{#each data.fa_versions as ver}
							<option value={ver}>{ver}</option>
						{/each}
					</select>
				</div>
				<div class="mb-3">
					<input type="checkbox" class="form-check-input" id="truncate" name="truncate" />
					<label for="truncate">Truncate</label>
				</div>
				<div class="mb-3">
					<label for="manoeuvre_ind">Manoeuvre Number</label>
					<input
						type="number"
						class="form-control"
						id="manoeuvre_ind"
						name="manoeuvre_ind"
						placeholder="Use Flight Score"
						min="1"
					/>
				</div>
				<div class="mb-3">
					<label for="n_days">Limit to flights in the last {n_days_val} days</label>
					<input
						type="range"
						class="form-range"
						value={n_days_val}
						id="n_days"
						name="n_days"
						min="30"
						max="380"
						step="10"
						on:change={_update_n_days}
					/>
				</div>
				<div class="mt-3">
					<button type="submit" class="btn btn-primary">Submit</button>
				</div>
			</form>
		</div>

		<div class="col" style="max-height:700px; overflow:scroll">
			<small>
				<table class="table table-success table-striped text-center">
					<thead class="table-dark sticky-top" style="z-index:-1">
						<tr>
							{#each col_heads as col_head}
								<th scope="col">{col_head}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each table_rows as row}
							<tr>
								<td>{row.table_rank}</td>
								<td>{row.rank}</td>
								<td>{row.name}</td>
								<td>{row.country}</td>
								<td>{row.date}</td>
								<td>{row.score}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</small>
		</div>
	</div>
</div>
