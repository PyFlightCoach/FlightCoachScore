<script lang="ts">
	import { library, reloadSchedules } from '$lib/schedule/library';
	import { user } from '$lib/stores/user';
	import { ScheduleHandler } from '$lib/schedule/schedule_handler.svelte';
	import { ManoeuvreHandler } from '$lib/manoeuvre/manoeuvre_handler.svelte';
	import EditManoeuvre from './EditManoeuvre.svelte';
	import { BoxLocation } from '$lib/manoeuvre/positioning.svelte';
	import { loading } from '$lib/stores/shared';
	import { saveAs } from 'file-saver';

	let {
		schedule = $bindable(),
		activeManId = $bindable(),
		onclear = () => {}
	}: {
		schedule: ScheduleHandler;
		activeManId: number | undefined;
		onclear?: () => void;
	} = $props();

	let categories: string[] = $derived([
		...$library.subset({ rule_name: schedule.builder.rule }).unique('category_name'),
		'New'
	]);

	let newCategory: string | undefined = $state(schedule.dbSchedule?.category_name || 'New');
	let newCategoryName: string | undefined = $state(
		schedule.dbSchedule?.category_name || schedule.builder.rule
	);
	let newScheduleName: string | undefined = $state(schedule.dbSchedule?.schedule_name || 'new');
	let owner_name: string = $derived(
		schedule.dbSchedule?.owner_name || ($user ? `${$user?.first_name} ${$user?.last_name}` : 'NA')
	);
</script>

<div class="row pt-2">
	<label class="col col-form-label" for="categories"
		><span>{schedule.builder.rule?.toUpperCase()} Category</span></label
	>
	<div class="col">
		<select
			class="form-select text-center"
			class:bg-warning={newCategory != schedule.dbSchedule?.category_name &&
				schedule.dbSchedule !== undefined}
			id="categories"
			disabled={!schedule.canIEdit}
			bind:value={newCategory}
		>
			{#each categories as r}
				<option value={r}>{r}</option>
			{/each}
		</select>
	</div>
</div>

{#if newCategory == 'New'}
	<div class="row pt-2">
		<label class="col col-form-label" for="newCategoryName"><span>New Category Name</span></label>
		<div class="col">
			<input
				class="form-control text-center"
				class:bg-warning={newCategoryName != schedule.dbSchedule?.category_name &&
					schedule.dbSchedule !== undefined}
				type="text"
				id="newCategoryName"
				disabled={!schedule.canIEdit}
				bind:value={newCategoryName}
			/>
		</div>
	</div>
{/if}

<div class="row pt-2">
	<label class="col col-form-label" for="newScheduleName"><span>Schedule Name</span></label>
	<div class="col">
		<input
			class="form-control text-center"
			class:bg-warning={newScheduleName != schedule.dbSchedule?.schedule_name &&
				schedule.dbSchedule !== undefined}
			type="text"
			id="newScheduleName"
			disabled={!schedule.canIEdit}
			bind:value={newScheduleName}
		/>
	</div>
</div>

<div class="row pt-2">
	<label class="col col-form-label" for="owner"><span>Owner</span></label>
	<div class="col">
		<input class="form-control text-center" type="text" id="owner" disabled value={owner_name} />
	</div>
</div>

<div class="row pt-2">
	{#if schedule.dbSchedule && schedule.canIEdit && schedule.dbSchedule.num_flights == 0}
		<button
			class="col col-form-control btn btn-outline-secondary mx-1"
			onclick={() => {
				if (confirm('Are you sure you want to delete this schedule?')) {
					schedule.delete();
					reloadSchedules();
				}
			}}
		>
			Delete
		</button>
	{:else if schedule.dbSchedule}
		<div class="col col-form-label">
			{#if schedule.dbSchedule}Flight Count = {schedule.dbSchedule?.num_flights}{/if}
		</div>
	{:else if schedule.canIEdit && ($user?.is_superuser || $user?.is_cd)}
		<button
			class="col col-form-input btn btn-outline-secondary mx-1"
			onclick={() => {
				if (schedule.dbSchedule) {
					$loading = true;
					schedule.patch().finally(() => ($loading = false));
				} else {
					$loading = true;
					schedule
						.post(newScheduleName!, newCategory == 'New' ? newCategoryName! : newCategory!)
						.finally(() => ($loading = false));
				}
			}}
		>
			{#if schedule.dbSchedule}Patch{:else}Post{/if}
		</button>
	{/if}
	{#if $user?.is_superuser}
		<button
			class="col col-form-input btn btn-outline-secondary mx-1"
			title="Download Aresti json file"
			onclick={() => {
				saveAs(
					new Blob([JSON.stringify(schedule.arestiJson(newScheduleName))], {type: "application/json"}),
					`${newScheduleName}.aresti.json`
				);
			}}
		>
			Aresti
		</button>
		<button
			class="col col-form-input btn btn-outline-secondary mx-1"
			title="Download Definition json file"
			onclick={() => {
				saveAs(
					new Blob([JSON.stringify(schedule.definitionJson(newCategoryName, newCategoryName))], {type: "application/json"}),
					`${newScheduleName}.definition.json`
				);
			}}
		>
			Definition
		</button>
	{/if}
	<button class="col col-form-input btn btn-outline-secondary mx-1" onclick={onclear}>
		Clear
	</button>
</div>

<div class="row p-2 pt-0">
	<div class="table-responsive pt-2 text-nowrap text-center">
		<table class="table table-sm border align-middle">
			<thead>
				<tr>
					<th scope="col" class="col-auto"></th>
					<th scope="col" class="col-auto">name</th>
					<th scope="col" class="col-auto">long name</th>
					<th scope="col" class="col-auto">K</th>
					<th scope="col" class="col-auto"></th>
				</tr>
			</thead>
			<tbody>
				{#each schedule?.manoeuvres || [] as manoeuvre, i}
					<tr>
						<td><lead>{manoeuvre.dbManoeuvre?.index || i + 1}</lead></td>
						{#if manoeuvre}
							<td class="p-0"
								><input
									type="text"
									class="form-control text-center"
									bind:value={manoeuvre.info.short_name}
									disabled={!schedule.canIEdit}
								/></td
							>
							<td class="p-0"
								><input
									type="text"
									class="form-control text-center"
									bind:value={manoeuvre.info.name}
									disabled={!schedule.canIEdit}
								/></td
							>
							<td class="p-0">
								<input
									type="number"
									class="form-control text-center"
									bind:value={manoeuvre.info.k}
									disabled={!schedule.canIEdit}
									onchange={(e) => {
										manoeuvre.info.k = parseInt((e.target as HTMLInputElement).value);
									}}
								/>
							</td>
							<td
								role="button"
								onclick={() => {
									if (activeManId == i) {
										activeManId = undefined;
									} else {
										activeManId = i;
									}
								}}
							>
								{#if activeManId == i}
									<i class="bi bi-chevron-up"></i>
								{:else}
									<i class="bi bi-chevron-down"></i>
								{/if}
							</td>
						{/if}
					</tr>
					{#if activeManId === i}
						<tr>
							<td colspan="5">
								<EditManoeuvre
									bind:manoeuvre={schedule.manoeuvres[i]}
									builder={schedule.builder}
									canEdit={schedule.canIEdit}
									ondelete={() => {
										activeManId = undefined;
										schedule.manoeuvres.splice(i, 1);
									}}
								/>
							</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	</div>
</div>

{#if schedule.canIEdit}
	<div class="row p-2 pt-0">
		<button
			class="btn btn-outline-secondary w-100"
			onclick={() => {
				let count = 0;

				for (const m of schedule.manoeuvres) {
					if (m.info.short_name.startsWith(`new${count || ''}`)) {
						count += 1;
					}
				}
				const name = `new${count + 1}`;
				schedule.manoeuvres.push(
					ManoeuvreHandler.empty(
						name,
						schedule.manoeuvres[schedule.manoeuvres.length - 1]?.info.end ||
							new BoxLocation('BTM', 'UPWIND', 'UPRIGHT')
					)
				);
			}}
		>
			Add Manoeuvre
		</button>
	</div>
{/if}
