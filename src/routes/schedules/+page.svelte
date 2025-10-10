<script lang="ts">
	import LoadScheduleHandler from './LoadScheduleHandler.svelte';
	import EditSchedule from './EditSchedule.svelte';
	import PlotAll from './PlotAll.svelte';
	import EditManoeuvre from './ManoeuvrePage.svelte';
	import { ScheduleHandler } from '$lib/schedule/schedule_handler.svelte';
  import * as nbc from '$lib/stores/navBarContents';

  nbc.reset();
	let form_state: string | undefined = $state();
	let activeManId: number | undefined = $state();
  

	let schedule: ScheduleHandler | undefined = $state();

</script>

<div class="col-md-4 bg-light border pt-3">
	<div style="position:relative; height: 100%;">
		<div
			class="px-2"
			style="overflow-x:hidden; overflow-y:auto; position: absolute; top: 0; left: 0; bottom: 0; right: 0;"
		>
			{#if form_state}
				<div class="row mt-4">
					<p><mark>{form_state}</mark></p>
				</div>
			{/if}
			{#if schedule}
				<EditSchedule {schedule} bind:activeManId onclear={()=>{schedule=undefined}}/>
			{:else}
				<LoadScheduleHandler bind:schedule />
			{/if}
		</div>
	</div>
</div>
<div class="col-md-8 pt-3">
	{#if schedule && schedule.manoeuvres.length}
		{#if activeManId != undefined}
			<EditManoeuvre man={schedule.manoeuvres[activeManId]} rule={schedule.builder.rule}/>
		{:else}
			<PlotAll {schedule} />
		{/if}
	{/if}
</div>
