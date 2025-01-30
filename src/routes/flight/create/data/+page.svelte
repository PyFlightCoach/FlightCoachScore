<script lang="ts">
	import { binData, origin, fcj, bin, bootTime, states, manSplits } from '$lib/stores/analysis';
	import { clearDataLoading } from '$lib/flight/analysis';
	import { dataSource } from '$lib/stores/shared';
	import FlightDataReader from '$lib/flight/FlightDataReader.svelte';
	import { BoxReader } from '$lib/flight/box';
	import { MapPlot } from '$lib/components/plots/map';
	import PlanViewPlot from '$lib/components/plots/PlanViewPlot.svelte';
	import { base } from '$app/paths';
	import { GPS } from '$lib/utils/geometry';
	import { States } from '$lib/utils/state';
	import { goto } from '$app/navigation';
	import { parseFCJMans, loadManDefs } from '$lib/flight/splitting';

	let inputMode: 'bin' | 'fcj' | 'state' = 'bin';
	let form_state: string | undefined;
	let target: GPS | undefined;
	let isDuplicate: boolean = false;
	$: if (inputMode) {
		if (inputMode != 'bin') {
			form_state = `You can can analyse a ${inputMode} file but you wont be able to upload it. Please use an Ardupilot bin file if possible.`;
		} else {
			form_state = undefined;
		}
	}

	$: if ($binData) {
		target = new GPS($binData.pos.Lat[0], $binData.pos.Lng[0], $binData.pos.Alt[0]);
	}

	$: if (isDuplicate != undefined) {
		if (isDuplicate) {
			$bin = undefined;
			form_state =
				'This bin file already exists on the server, You can analyse the flight but you wont be able to upload it.';
		} else {
			form_state = undefined;
		}
	}
</script>

<div class="col-md-4 pt-3 bg-light border">
	<small>Load Flight Data</small>

	<FlightDataReader
		bind:bin={$bin}
		bind:binData={$binData}
		bind:bootTime={$bootTime}
		bind:fcj={$fcj}
		bind:states={$states}
		bind:inputMode
		bind:isDuplicate
		onBeforeLoad={clearDataLoading}
	/>

	{#if form_state}
		<div class="row mt-4">
			<p><mark>{form_state}</mark></p>
		</div>
	{/if}
	<hr />

	{#if inputMode == 'bin'}
		<small>Define The Box</small>
		<BoxReader bind:origin={$origin} bind:fcjson={$fcj} bind:target />

		<hr />
	{/if}

	{#if ($binData && $origin) || $states}
		<div class="row">
			<label class="col col-form-label" for="select-manoeuvres">Select Manoeuvres:</label>
			<button
				id="select-manoeuvres"
				class="btn btn-outline-primary col"
				on:click={async () => {
					$dataSource = inputMode;
					if ($origin) {
						$origin.save();
					}
					if ($binData && $origin) {
						$states = States.from_xkf1($origin, $binData.orgn, $binData.xkf1);
					}
					if ($fcj) $manSplits = await parseFCJMans($fcj, $states!).then(loadManDefs);

          goto(base + '/flight/create/manoeuvres');
				}}
			>
				Next
			</button>
		</div>
	{/if}
</div>

<div class="col-md-8">
	{#if ($origin && !$states) || $binData}
		<MapPlot bind:origin={$origin} bind:binData={$binData} />
	{:else if $states}
		<PlanViewPlot />
	{/if}
</div>
