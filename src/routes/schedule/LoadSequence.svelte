<script lang="ts">
	import { library } from '$lib/schedules/library';
	import SelectSchedule from '$lib/components/manselect/SelectSchedule.svelte';
	import {
		rule,
		parseDB,
		parseOlan,
		lastSelectedScheduleID,
		rules,
    addEmptyManoeuvre
	} from '$lib/schedules/schedule_builder';
	import type { DBSchedule } from '$lib/database/interfaces';
	import { BoxLocation } from '$lib/schedules/maninfo';

	let inputmode: string = $state('DB');
	let olan: string = $state('88c24');
	let selectedSchedule: DBSchedule | undefined = $state($library.subset({ schedule_id: $lastSelectedScheduleID }).first || $library.first);

</script>

<div class="row pt-2 px-2">
	<label class="col col-form-label" for="inputmode"><span>Input Mode</span></label>
	<select class="col col-form-input form-select text-center" id="inputmode" bind:value={inputmode}>
		<option value="OLAN">Open Aero</option>
		<option value="DB">Database</option>
		<option value="manual">Manual</option>
	</select>
</div>

<div class="row pt-2 px-2">
	<label class="col col-form-label" for="rules"><span>Rules</span></label>
	<select
		class="col col-form-control form-select text-center"
		id="rules"
		disabled={inputmode == 'DB'}
		bind:value={$rule}
	>
		{#each $rules as r}
			<option value={r}>{r}</option>
		{/each}
	</select>
</div>

{#if inputmode == 'OLAN'}
	<div class="row pt-2 px-2">
		<label class="col-auto col-form-label" for="olanstring"
			><span>
				<a href="https://openaero.net/doc/language.html" target="”_blank”">OLAN</a> String
			</span></label
		>
    <div class="col">
		<textarea id="olanstring" class="form-control" rows="5" bind:value={olan}></textarea></div>
	</div>
{/if}

{#if inputmode == 'DB'}
	<SelectSchedule
		library={$library}
    schedule_id={$library.subset({rule_name: $rule}).first?.schedule_id}
		onselected={(category_name, schedule) => {
			if (category_name) {
				$rule = $library.subset({ category_name }).first.rule_name;
			}
			selectedSchedule = schedule;
			$lastSelectedScheduleID = selectedSchedule?.schedule_id;
		}}
	/>
{/if}

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
        case 'manual':
          addEmptyManoeuvre('new', new BoxLocation('BTM', 'UPWIND', 'UPRIGHT'));
          break;
      }
    }}
    >{#if inputmode == 'DB'}Load{:else}Create{/if}</button
  >
</div>

