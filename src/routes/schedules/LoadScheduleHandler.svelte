<script lang="ts">
	import { library, reloadSchedules } from '$lib/schedule/library';
	import SelectSchedule from '$lib/schedule/SelectSchedule.svelte';
	import { ScheduleHandler } from '$lib/schedule/schedule_handler.svelte';
	import { type DBSchedule } from '$lib/schedule/db';
	import { loading, rules } from '$lib/stores/shared';
	import { user } from '$lib/stores/user';
  import {dbServer} from '$lib/api';
	import { prettyPrintHttpError } from '$lib/utils/text';

  let { schedule = $bindable() }: { schedule: ScheduleHandler | undefined } = $props();

	let inputmode: string = $state('DB');
	let rule: string = $state('f3a');
	let olan: string = $state('88c24');
	let selectedSchedule: DBSchedule | undefined = $state(
		schedule?.dbSchedule ? schedule.dbSchedule : $library.first
	);

	let files: FileList | undefined = $state();

	async function createSchedule() {
		switch (inputmode) {
			case 'OLAN':
				return ScheduleHandler.parseOlan(olan, rule);
			case 'DB':
				return ScheduleHandler.parseDB(selectedSchedule!);
			case 'manual':
				return ScheduleHandler.empty(rule).then((res) => (schedule = res));
			case 'json':
				return ScheduleHandler.parseJSON(files![0]);
		}
	}
</script>

<div class="row pt-2 px-2">
	<label class="col col-form-label" for="inputmode"><span>Input Mode</span></label>
	<select class="col col-form-input form-select text-center" id="inputmode" bind:value={inputmode}>
		<option value="OLAN">Open Aero</option>
		<option value="DB">Database</option>
		<option value="manual">Manual</option>
		<option value="json">JSON</option>
	</select>
</div>

{#if ['manual', 'OLAN'].includes(inputmode)}
	<div class="row pt-2 px-2">
		<label class="col col-form-label" for="rules"><span>Rules</span></label>
		<select
			class="col col-form-control form-select text-center"
			id="rules"
			disabled={inputmode == 'DB'}
			bind:value={rule}
		>
			{#each $rules || [] as r}
				<option value={r}>{r}</option>
			{/each}
		</select>
	</div>
{/if}
{#if inputmode == 'OLAN'}
	<div class="row pt-2 px-2">
		<label class="col-auto col-form-label" for="olanstring"
			><span>
				<a href="https://openaero.net/doc/language.html" target="”_blank”">OLAN</a> String
			</span></label
		>
		<div class="col">
			<textarea id="olanstring" class="form-control" rows="5" bind:value={olan}></textarea>
		</div>
	</div>
{/if}
{#if inputmode == 'DB'}
	<SelectSchedule
		library={$library}
		schedule_id={selectedSchedule?.schedule_id}
		onselected={(category_name, sched) => {
			if (category_name) {
				rule = $library.subset({ category_name }).first.rule_name;
			}
			selectedSchedule = sched;
		}}
	/>
{/if}
{#if inputmode == 'json'}
	<div class="row pt-2 px-2">
		<label class="btn btn-outline-secondary form-control text-nowrap" for="jsonfile">
			{#if !files || files.length == 0}
				Select JSON File
			{:else}
				{files[0].name}
			{/if}
		</label>
		<input
			class="form-control d-none"
			type="file"
			id="jsonfile"
			accept=".json"
			onchange={(e) => {
				files = (e.target as HTMLInputElement).files ?? undefined;
				console.log(files);
			}}
		/>
	</div>
{/if}

<div class="row pt-2">
	<div class="col">
		{#if $user?.is_superuser && inputmode == 'DB' && selectedSchedule}
			<button class="col col-form-control btn btn-outline-secondary mx-2" onclick={() => {
        if (confirm("Are you sure you want to delete this schedule?")) {
          dbServer.delete(`schedule/${selectedSchedule?.schedule_id}`)
          .then(reloadSchedules)
          .catch(err => alert(`Error deleting schedule: ${prettyPrintHttpError(err)}`))
        }
      }}>
				Delete
			</button>
		{/if}
	</div>
	<button
		class="col col-form-control btn btn-outline-secondary mx-2"
		onclick={() => {
			$loading = true;
			createSchedule()
				.then((res) => {
					schedule = res;
				})
				.catch((err) => {alert(`Error loading schedule: ${prettyPrintHttpError(err)}`)})
				.finally(() => ($loading = false));
		}}
		>{#if inputmode == 'DB'}Load{:else}Create{/if}</button
	>
</div>
