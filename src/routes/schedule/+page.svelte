<script lang="ts">
	import LoadSequence from './LoadSequence.svelte';
	import EditManoeuvres from './EditManoeuvres.svelte';
	import EditSequence from './EditSequence.svelte';
	import PlotAll from './PlotAll.svelte';
	import EditManoeuvre from './ManoeuvrePage.svelte';
	import navBarContents from '$lib/stores/navBarContents';
  import * as sh from '$lib/schedule/schedule_handler';


	let form_state: string | undefined = $state();
	let activeManId: number | undefined = $state();

  let schedule: sh.ScheduleHandler | undefined = $state();



	$navBarContents = undefined;
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
			{#if !schedule}
				<LoadSequence bind:schedule />
			{:else}
				<EditSequence bind:schedule />
        <button class="col col-form-input btn btn-outline-secondary mx-2" onclick={schedule=undefined}>
          Clear
        </button>
        <EditManoeuvres bind:activeManId />
			{/if}

			
		</div>
	</div>
</div>
<div class="col-md-8 pt-3">
	{#if schedule}
		{#if activeManId != undefined}
			<EditManoeuvre man={schedule.manoeuvres[activeManId]} />
		{:else}
			<PlotAll />
		{/if}
	{/if}
</div>
