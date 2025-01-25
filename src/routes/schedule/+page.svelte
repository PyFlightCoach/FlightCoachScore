<script lang="ts">
	import LoadSequence from './LoadSequence.svelte';
	import EditManoeuvres from './EditManoeuvres.svelte';
	import EditSequence from './EditSequence.svelte';
	import { mans } from '$lib/schedules/schedule_builder';
	import PlotAll from './PlotAll.svelte';
	import EditManoeuvre from './ManoeuvrePage.svelte';
	import navBarContents from '$lib/stores/navBarContents';

	let form_state: string | undefined = $state();
	let activeManId: number | undefined = $state();

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
			{#if $mans.length == 0}
				<LoadSequence />
			{:else}
				<EditSequence bind:activeManId />
        <EditManoeuvres bind:activeManId />
			{/if}

			
		</div>
	</div>
</div>
<div class="col-md-8 pt-3">
	{#if $mans.length > 0}
		{#if activeManId != undefined}
			<EditManoeuvre man={$mans[activeManId]} />
		{:else}
			<PlotAll />
		{/if}
	{/if}
</div>
