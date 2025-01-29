<script lang="ts">
	import { library } from '$lib/schedules/library';
	import {
		mans,
		dbSchedule,
		canIEdit,
		rule,
		deleteSchedule
	} from '$lib/schedules/builder.svelte';
	import { user } from '$lib/stores/user';
  import * as sh from '$lib/schedules/schedule_handler';


  let {schedule = $bindable()}: {schedule: sh.ScheduleHandler} = $props();

	let categories: string[] = $derived([
		...$library.subset({ rule_name: $rule }).unique('category_name'),
		'New'
	]);

	let selected_category: string | undefined = $state(schedule.dbSchedule?.category_name || 'New');
  let category_name: string | undefined = $state(selected_category || $rule);
	let schedule_name: string | undefined = $state($dbSchedule?.schedule_name || 'new');
	let owner_name: string = $derived(
		$dbSchedule?.owner_name || ($user ? `${$user?.first_name} ${$user?.last_name}` : 'NA')
	);


</script>

<div class="row pt-2">
	<label class="col col-form-label" for="categories"
		><span>{$rule?.toUpperCase()} Category</span></label
	>
	<div class="col">
		<select
			class="form-select text-center"
			id="categories"
			disabled={!$canIEdit}
			bind:value={selected_category}
		>
			{#each categories as r}
				<option value={r}>{r}</option>
			{/each}
		</select>
	</div>
</div>

{#if selected_category == 'New'}
	<div class="row pt-2">
		<label class="col col-form-label" for="category_name"><span>New Category Name</span></label>
		<div class="col">
			<input
				class="form-control text-center"
				type="text"
				id="category_name"
				disabled={!$canIEdit}
				bind:value={category_name}
			/>
		</div>
	</div>
{/if}

<div class="row pt-2">
	<label class="col col-form-label" for="schedule_name"><span>Schedule Name</span></label>
	<div class="col">
		<input
			class="form-control text-center"
			type="text"
			id="schedule_name"
			disabled={!$canIEdit}
			bind:value={schedule_name}
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
	{#if $dbSchedule && $canIEdit && $dbSchedule.num_flights == 0}
		<button
			class="col col-form-control btn btn-outline-secondary mx-2"
			onclick={() => {
				if (confirm('Are you sure you want to delete this schedule?')) {
					deleteSchedule($dbSchedule!.schedule_id);
				}
			}}
		>
			Delete
		</button>
	{:else if $dbSchedule}
		<div class="col col-form-label">
			{#if $dbSchedule}Flight Count = {$dbSchedule?.num_flights}{/if}
		</div>
  {:else if $canIEdit}
    <button class="col col-form-input btn btn-outline-secondary mx-2" onclick={()=>{if (schedule.dbSchedule) {sh.patch(schedule)} else {sh.post(schedule)}}}>
      {#if $dbSchedule}Patch{:else}Post{/if}
    </button>
	{/if}

</div>
