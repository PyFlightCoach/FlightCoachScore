<script lang="ts">
	import { binData, origin, fcj, bin, bootTime, states } from '$lib/stores/analysis';
	import FlightDataReader from '$lib/components/FlightDataReader.svelte';
	import { BoxReader } from '$lib/components/box';
	import { MapPlot } from '$lib/components/plots/map';
	import PlanViewPlot from '$lib/components/plots/PlanViewPlot.svelte';
	import { base } from '$app/paths';
	import Help from './Help.svelte';
	import { GPS } from '$lib/analysis/geometry';
	import { Origin } from '$lib/analysis/fcjson';

	let inputMode: 'bin' | 'fcj' | 'state' = 'bin';
	let form_state: string | undefined;
  let target: GPS | undefined;
	$: if (inputMode) {
		$bin = undefined;
		$binData = undefined;
		$bootTime = undefined;
		$fcj = undefined;
		$states = undefined;
		if (inputMode != 'bin') {
			form_state = `You can can analyse a ${inputMode} file but you wont be able to upload it. Please use an Ardupilot bin file if possible.`;
		} else {
			form_state = undefined;
		}
	}
  $origin = Origin.load();
  $: console.log($origin);
  $: if ($binData) {
    target=new GPS($binData.pos.Lat[0], $binData.pos.Lng[0], $binData.pos.Alt[0]);
  }

	$: if ($binData && !$bin) {
		form_state =
			'This bin file already exists on the server, You can analyse the flight but you wont be able to upload it.';
	}
</script>

<div class="col-4 pt-5">
	<div class="container bg-light border">
		<small>Load Flight Data</small>

		<FlightDataReader
			bind:bin={$bin}
			bind:binData={$binData}
			bind:bootTime={$bootTime}
			bind:fcj={$fcj}
			bind:states={$states}
			bind:inputMode
		/>

		{#if form_state}
			<div class="row mt-4">
				<p><mark>{form_state}</mark></p>
			</div>
		{/if}
	</div>

	{#if inputMode == 'bin'}
		<div class="container bg-light border">
			<small>Define The Box</small>
			<BoxReader
				bind:origin={$origin}
				bind:fcjson={$fcj}
				bind:target
			/>
		</div>
	{/if}

	{#if ($binData && $origin) || $states}
		<div class="container bg-light border">
			<small>Select Manoeuvres</small>
			<div class="row">
				<label class="col" for="select-manoeuvres">Move on to the next stage:</label>
				<a
					id="select-manoeuvres"
					class="btn btn-outline-primary col"
					href={base + '/flight/create/manoeuvres'}
          on:click={()=>{if($origin) {$origin.save()}}}
				>
					Next
				</a>
			</div>
		</div>
	{/if}
</div>

<div class="col-8">
	{#if $origin || $binData}
		<MapPlot bind:origin={$origin} bind:binData={$binData} />
	{:else if $states}
		<PlanViewPlot />
	{:else}
		<Help />
	{/if}
</div>
