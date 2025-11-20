<script lang="ts">
	import LoadScheduleHandler from './LoadScheduleHandler.svelte';
	import EditSchedule from './EditSchedule.svelte';
	import PlotAll from './PlotAll.svelte';
	import EditManoeuvre from './ManoeuvrePage.svelte';
	import { ScheduleHandler } from '$lib/schedule/schedule_handler.svelte';
	import SideBarLayout from '$lib/components/SideBarLayout.svelte';

	let form_state: string | undefined = $state();
	let activeManId: number | undefined = $state();

	let schedule: ScheduleHandler | undefined = $state();
</script>

<SideBarLayout sideBarWidth={4}>
	{#snippet side()}
		{#if form_state}
			<div class="row mt-4">
				<p><mark>{form_state}</mark></p>
			</div>
		{/if}
		{#if schedule}
			<EditSchedule
				{schedule}
				bind:activeManId
				onclear={() => {
					schedule = undefined;
				}}
			/>
		{:else}
			<LoadScheduleHandler bind:schedule />
		{/if}
	{/snippet}
	{#snippet main()}
		{#if schedule && schedule.manoeuvres.length}
			{#if activeManId != undefined}
				<EditManoeuvre man={schedule.manoeuvres[activeManId]} rule={schedule.builder.rule} />
			{:else}
				<PlotAll {schedule} />
			{/if}
		{/if}
	{/snippet}
</SideBarLayout>
