<script lang="ts">
	import { library } from '$lib/schedules/library';
	import SelectSchedule from '$lib/components/manselect/SelectSchedule.svelte';
	import {
		rule,
		parseDB,
		parseOlan,
		lastSelectedScheduleID,
	} from '$lib/schedules/schedule_builder';
	import type { DBSchedule } from '$lib/database/interfaces';

	let rules: string[] = $state($library.unique('rule_name'));
	let inputmode: string = $state('DB');
	let olan: string = $state('o');
	let selectedSchedule: DBSchedule | undefined = $state($library.subset({ schedule_id: $lastSelectedScheduleID }).first || $library.first);

</script>

<div class="row pt-2 px-2">
	<label class="col col-form-label" for="inputmode"><span>Input Mode:</span></label>
	<select class="col col-form-input form-select" id="inputmode" bind:value={inputmode}>
		<option value="OLAN">Open Aero</option>
		<option value="DB">Database</option>
		<option value="manual">Manual</option>
	</select>
</div>

<div class="row pt-2 px-2">
	<label class="col col-form-label" for="olanstring"><span>Select Rules:</span></label>
	<select
		class="col col-form-control form-select text-center"
		id="rules"
		disabled={inputmode == 'DB'}
		bind:value={$rule}
	>
		{#each rules as r}
			<option value={r}>{r}</option>
		{/each}
	</select>
</div>

{#if inputmode == 'OLAN'}
	<div class="row pt-2 px-2">
		<label class="col-auto col-form-label" for="olanstring"
			><span>
				Enter <a href="https://openaero.net/doc/language.html" target="”_blank”">OLAN</a> string:
			</span></label
		>
		<textarea id="olanstring" class="col form-control" rows="5" bind:value={olan}></textarea>
	</div>
{/if}

{#if inputmode == 'DB'}
	<SelectSchedule
		library={$library}
		schedule_id={$lastSelectedScheduleID}
		onselected={(category_name, schedule) => {
			console.log(category_name);
			if (category_name) {
				$rule = $library.subset({ category_name }).first.rule_name;
			}
			selectedSchedule = schedule;
			$lastSelectedScheduleID = selectedSchedule?.schedule_id;
		}}
	/>
{/if}

{#if inputmode != 'manual'}
	<div class="row pt-2">
		<div class="col"></div>
		<button
			class="col col-form-control btn btn-outline-secondary mx-2"
			onclick={() => {
				switch (inputmode) {
					case 'OLAN':
						if ($rule) parseOlan(olan, $rule);
						break;
					case 'DB':
						if (selectedSchedule) parseDB(selectedSchedule);
						break;
				}
			}}
			>{#if inputmode == 'DB'}Load{:else}Create{/if}</button
		>
	</div>
{/if}
