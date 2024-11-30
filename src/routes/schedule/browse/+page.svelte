<script lang="ts">
	import { library } from '$lib/schedules';
	
	let selectedCategory: string | undefined = undefined;
	let selectedSchedule: string | undefined = undefined;
</script>

<div class="col-lg-2 pt-5">
	<h3>Categories</h3>
	<table class="table table-sm">
		<thead>
			<tr>
				<th>Category</th>
				<th>Rule</th>
			</tr>
		</thead>
		<tbody>
			{#each Object.values(library) as category}
				<tr>
					<td>{category.category_name}</td>
					<td>{category.rule_name}</td>
					<td>
						<input
							class="radio"
							type="radio"
							name="z"
							value={category.category_name}
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
				{#each Object.values(library[selectedCategory].schedules!) as schedule}
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
				{#each Object.values(library[selectedCategory].schedules![selectedSchedule].manoeuvres) as manoeuvre}
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
