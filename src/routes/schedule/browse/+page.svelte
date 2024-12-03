<script lang="ts">
	import { library, loadKnowns } from '$lib/schedules';

	loadKnowns();
	let selectedCategory: string | undefined = undefined;
	let selectedSchedule: string | undefined = undefined;
</script>

<div class="col-lg-2 pt-5">
	<h3>Categories</h3>
	<table class="table table-sm">
		<thead>
			<tr>
				<th>Category</th>
				<th>rule_name</th>
				<th>n</th>
			</tr>
		</thead>
		<tbody>
			{#each $library
				.unique('category_name')
				.map((catn) => $library.subset({ category_name: catn })) as catlib}
				<tr>
					<td>{catlib.first.category_name}</td>
					<td>{catlib.first.rule_name}</td>
					<td>{catlib.length}</td>
					<td>
						<input
							class="radio"
							type="radio"
							name="z"
							value={catlib.first.category_name}
							bind:group={selectedCategory}
							on:change={() => {
								selectedSchedule = undefined;
							}}
						/>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
<div class="col-lg-2 pt-5">
	<h3>Schedules</h3>
	{#if selectedCategory}
		<table class="table table-sm">
			<thead>
				<tr>
					<th>Schedule</th>
					<th>Owner</th>
				</tr>
			</thead>
			<tbody>
				{#each $library.subset({ category_name: selectedCategory }).schedules as schedule}
					<tr>
						<td>{schedule.schedule_name}</td>
						<td>{schedule.owner_name}</td>
						<td>
							<input
								class="radio"
								type="radio"
								name="y"
								value={schedule.schedule_name}
								bind:group={selectedSchedule}
							/>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>
<div class="col-lg-2 pt-5">
	<h3>Manoeuvres</h3>
	{#if selectedCategory && selectedSchedule}
		<table class="table table-sm">
			<thead>
				<tr>
					<th>ID</th>
					<th>Name</th>
					<th>K</th>
					<th>Version</th>
				</tr>
			</thead>
			<tbody>
				{#each $library.subset( { category_name: selectedCategory, schedule_name: selectedSchedule } ).first.manoeuvres as manoeuvre}
					<tr>
						<td>{manoeuvre.index}</td>
						<td>{manoeuvre.short_name}</td>
						<td>{manoeuvre.k}</td>
						<td>{manoeuvre.version}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>
