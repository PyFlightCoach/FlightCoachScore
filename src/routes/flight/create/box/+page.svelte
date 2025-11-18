<script lang="ts">
	import MapPlot from '$lib/plots/map/MapPlot.svelte';
	import PlotSec from '$lib/plots/PlotSec.svelte';
	import { activeFlight, isFullSize } from '$lib/stores/shared';
	import SideBarLayout from '$lib/components/SideBarLayout.svelte';
	import BoxReader from '$lib/flight/box/BoxReader.svelte';
	import { Origin } from '$lib/flight/fcjson';
	import { BinData } from '$lib/flight/bin';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import DisplayDict from '$lib/components/DisplayDict.svelte';
	import { user } from '$lib/stores/user';
	import { GPS } from '$lib/utils/geometry';
	import { breakPoints, breakPoint } from '$lib/stores/shared';
  import {  nRunning } from '$lib/stores/analysis';


	let newOrigin = $state($activeFlight!.origin);

	let newStates = $derived($activeFlight!.statesAtNewOrigin(newOrigin!));

	let binDataOrigin = $derived(
		$activeFlight!.rawData instanceof BinData ? $activeFlight!.rawData.findOrigin() : undefined
	);

	let boxDisplay: 'F3A' | 'IMAC' | 'IAC' = $state(
		$activeFlight?.kind === 'acrowrx' ? 'IAC' : 'F3A'
	);
	let display: 'map' | 'state' = $state($activeFlight!.origin ? 'state' : 'map');

	$effect(() => {
		$isFullSize = boxDisplay === 'IAC';
	});

  let boxFile: File | undefined = $state(undefined);

</script>

<SideBarLayout sideBarWidth={4}>
	{#snippet side()}
		<div class="row">
			<span class="h4 fw-bold text-start px-4 mt-2">Define the Box</span>
		</div>
		<hr class="mt-0" />
		<div class="row">
			<div class="col-auto">
				<label for="displayOptions" class="col-auto col-form-label">Display:</label>
				<div id="displayOptions" class="col-auto btn-group">
					<input type="radio" class="btn-check" value="map" id="mapDisplay" bind:group={display} />
					<label class="btn btn-outline-secondary btn-sm" for="mapDisplay">Map</label>
					<input
						type="radio"
						class="btn-check"
						value="state"
						id="stateDisplay"
						bind:group={display}
					/>
					<label class="btn btn-outline-secondary btn-sm" for="stateDisplay">3D</label>
				</div>
			</div>
			<div class="col-auto">
				<label for="boxOptions" class="col-auto col-form-label">Box:</label>
				<div id="boxOptions" class="col btn-group">
					<input
						type="radio"
						class="btn-check"
						value="F3A"
						id="F3ADisplay"
						bind:group={boxDisplay}
					/>
					<label class="btn btn-outline-secondary btn-sm" for="F3ADisplay">F3A</label>
					<input
						type="radio"
						class="btn-check"
						value="IMAC"
						id="IMACDisplay"
						bind:group={boxDisplay}
					/>
					<label class="btn btn-outline-secondary btn-sm" for="IMACDisplay">IMAC</label>
					<input
						type="radio"
						class="btn-check"
						value="IAC"
						id="IACDisplay"
						bind:group={boxDisplay}
					/>
					<label class="btn btn-outline-secondary btn-sm" for="IACDisplay">IAC/CIVA</label>
				</div>
			</div>
		</div>

		{#if binDataOrigin && GPS.sub(newOrigin!.pilot!, binDataOrigin).length() > 500}
			<div class="alert alert-warning" role="alert">
				<strong>Warning:</strong> The box is a long way from the flight data. 
        Please check this is correct.
			</div>
		{:else if !$activeFlight!.checkOriginElevation(newOrigin, 10)}
			<div class="alert alert-warning" role="alert">
				<strong>Warning:</strong> The box elevation is more than 10m from the 
        initial elevation ({binDataOrigin?.alt.toFixed(
					0
				)}m). Click
				<button
					class="btn btn-link p-0"
					onclick={() => {
						newOrigin = new Origin(
              newOrigin!.lat,
              newOrigin!.lng,
              binDataOrigin!.alt,
              newOrigin!.heading,
              newOrigin!.move_east,
              newOrigin!.move_north
            );
					}}>here</button
				> to reset it to the initial elevation.
			</div>
		{/if}

		{#if $activeFlight!.kind === 'acrowrx'}
			<p>
				The position of the box has been taken from Acrowrx, but all judging in FCScore assumes a
				base height of 100m. You can shift the box here to suit your flight using the input below.
			</p>
		{/if}

		<BoxReader
			target={$activeFlight!.rawData instanceof BinData
				? ($activeFlight!.rawData as BinData).findOrigin()
				: $activeFlight?.origin!.pilot!}
			origin={newOrigin!}
			onorigin={(neworigin: Origin) => (newOrigin = neworigin)}
			siteInputMode={newOrigin ? 'ph' : 'fcsites'}
      bind:boxFile={boxFile}
		/>

		<div class="row px-2">
			<button
				class="col btn btn-outline-secondary"
				onclick={() => {
					newOrigin = $activeFlight!.origin;
          boxFile = undefined;
				}}
        title="Reset the box to the original origin"
			>
				Reset
			</button>
			<button
				class="col btn btn-outline-primary"
        data-bs-dismiss={breakPoints['lg'] > breakPoints[$breakPoint] ? 'offcanvas' : undefined}
        disabled={!!$nRunning}
				onclick={() => {
					if (!Origin.equals(newOrigin, $activeFlight?.origin)) {
						$activeFlight = $activeFlight!.withNewOrigin(newOrigin!);
					}
					goto(resolve('/flight/create/manoeuvres'));
				}}>Next</button
			>
		</div>
		{#if $user?.is_superuser}
			<DisplayDict dict={newOrigin as Record<string, any>} title="New Origin Details" />
			<DisplayDict
				dict={($activeFlight?.origin as Record<string, any>) || {}}
				title="Active Flight Origin Details"
			/>
		{/if}
	{/snippet}

	{#snippet main()}
		{#if display === 'map'}
			<MapPlot bind:origin={newOrigin} data={$activeFlight!.gps()} bind:kind={boxDisplay} />
		{:else if display === 'state'}
			<PlotSec
				bind:flst={newStates}
				controls={[]}
				showBox={true}
				bind:boxDisplay
				includeZero={true}
				scale={boxDisplay === 'IAC' ? 3.5 : 1.5}
			/>
		{/if}
	{/snippet}
</SideBarLayout>
