<script lang="ts">
	import { dbServer } from '$lib/api';
	import { library } from '$lib/schedules';
	import { onMount } from 'svelte';

	let schedule_id: string | undefined = $state(undefined);
	let category_id: string | undefined = $state(undefined);
	let n_days: number | undefined = $state(undefined);
	let date_after: number | undefined = $state(undefined);
	let date_before: number | undefined = $state(undefined);
	let includeAll: boolean | undefined = $state(undefined);

	const query_parameters = $derived.by(() => {
		let parms: string[] = [];
		if (schedule_id) parms.push(`schedule_id=${schedule_id}`);
		if (category_id) parms.push(`category_id=${category_id}`);
		if (n_days) parms.push(`n_days=${n_days}`);
		if (date_after) parms.push(`date_after=${date_after}`);
		if (date_before) parms.push(`date_before=${date_before}`);
		if (includeAll != undefined) parms.push(`includeAll=${includeAll}`);
		if (parms.length == 0) return '';
		return '?' + parms.join('&');
	});

	interface UserActivityResponse {
		id: string;
		name: string;
		country: string;
		top_schedule_id: string;
		top_schedule_n: number;
		best_rank_schedule_id: string;
		best_rank: number;
		best_norm_rank_schedule_id: string;
		best_norm_rank: number;
		total_n: number;
	}

	const request_activity = () => {
		dbServer
			.get('/analysis/user_activity' + query_parameters)
			.then((res) => {
				data = res.data.results as UserActivityResponse[];
			})
			.catch((err) => {
				console.log(err);
			});
	};

	let data: UserActivityResponse[] = $state([]);

	onMount(() => {
		request_activity();
	});
</script>

<div class="row justify-content-center pt-0">
	<div class="col-auto text-center">
		<h1 class="h-1 pt-md-3">Top Users</h1>
		<div class="row table-responsive">
			<table class="table">
				<thead>
					<tr>
						<th>#</th>
						<th>Pilot</th>
						<th>Flights</th>
						<th>Country</th>
            <th>Best Rank</th>
            <th>Best Schedule</th>
					</tr>
				</thead>
				<tbody>
					{#each data as row, i}
						<tr class="align-middle">
							<td>{i + 1}</td>
							<td>{row.name}</td>
							<td>{row.total_n}</td>
							<td>{row.country}</td>
              <td>{row.best_rank}</td>
              <td>{$library.subset({schedule_id: row.best_rank_schedule_id}).first.schedule_name}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
