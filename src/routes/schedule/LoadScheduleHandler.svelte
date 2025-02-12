<script lang="ts">
	import { library } from '$lib/schedule/library';
	import SelectSchedule from '$lib/schedule/SelectSchedule.svelte';
	import { ScheduleHandler } from '$lib/schedule/schedule_handler.svelte';
	import { type DBSchedule } from '$lib/schedule/db';
	import { loading, rules } from '$lib/stores/shared';

	let { schedule=$bindable() }: { schedule: ScheduleHandler | undefined } = $props();

	let inputmode: string = $state('DB');
	let rule: string = $state('f3a');
	let olan: string = $state('88c24');
	let selectedSchedule: DBSchedule | undefined = $state(schedule?.dbSchedule ? schedule.dbSchedule :$library.first);

  async function createSchedule() {
    switch (inputmode) {
      case 'OLAN':
        return ScheduleHandler.parseOlan(olan, rule);
      case 'DB':
        return ScheduleHandler.parseDB(selectedSchedule!);
      case 'manual':
        return ScheduleHandler.empty(rule).then(res=>schedule=res);
    }
  }

</script>

<div class="row pt-2 px-2">
	<label class="col col-form-label" for="inputmode"><span>Input Mode</span></label>
	<select class="col col-form-input form-select text-center" id="inputmode" bind:value={inputmode}>
		<option value="OLAN">Open Aero</option>
		<option value="DB">Database</option>
		<option value="manual">Manual</option>
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
      {#each $rules as r}
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

<div class="row pt-2">
	<div class="col"></div>
	<button
		class="col col-form-control btn btn-outline-secondary mx-2"
		onclick={() => {
      $loading = true;
      createSchedule().then(res=>{schedule=res})
      .catch(err=>console.error(err))
      .finally(()=>$loading=false);
		}}
		>{#if inputmode == 'DB'}Load{:else}Create{/if}</button
	>
</div>
