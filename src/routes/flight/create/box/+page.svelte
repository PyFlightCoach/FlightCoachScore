<script lang="ts">
	import MapPlot from '$lib/plots/map/MapPlot.svelte';
	import PlotSec from '$lib/plots/PlotSec.svelte';
	import { flight } from '$lib/stores/flight';
	import SideBarLayout from '$lib/components/SideBarLayout.svelte';
	import BoxReader from '$lib/flight/box/BoxReader.svelte';
	import { FCJson, Origin } from '$lib/flight/fcjson';
	import { BinData } from '$lib/flight/bin';
	import { Point } from '$lib/utils/geometry';
	import { Flight, FlightDataSource } from '$lib/flight/flight';
	import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';

	let shiftz = $state(0);

	let newOrigin = $state($flight!.origin);
	let newStates = $derived($flight!.source.states(newOrigin!)!.shift(new Point(0, 0, shiftz)));

	let boxDisplay: 'F3A' | 'IMAC' | 'IAC' = $state($flight?.source.kind === 'bin' ? 'F3A' : 'IAC');
	let display: 'map' | 'state' = $state($flight!.origin ? 'state' : 'map');
</script>

<SideBarLayout sideBarWidth={4}>
	{#snippet side()}
		<div class="row">
			{#if $flight!.source!.kind === 'bin'}
				<label for="displayOptions" class="col-auto col-form-label">Display:</label>
				<div id="displayOptions" class="col mb-2 py-2 btn-group">
					<input type="radio" class="btn-check" value="map" id="mapDisplay" bind:group={display} />
					<label class="btn btn-outline-secondary btn-sm" for="mapDisplay">Map</label>
					<input
						type="radio"
						class="btn-check"
						value="state"
						id="stateDisplay"
						bind:group={display}
					/>
					<label class="btn btn-outline-secondary btn-sm" for="stateDisplay">State</label>
				</div>
			{/if}
			<label for="boxOptions" class="col-auto col-form-label">Box:</label>
			<div id="boxOptions" class="col mb-2 py-2 btn-group">
        {#if $flight!.source!.kind !== 'acrowrx'}
				<input type="radio" class="btn-check" value="F3A" id="F3ADisplay" bind:group={boxDisplay} />
				<label class="btn btn-outline-secondary btn-sm" for="F3ADisplay">F3A</label>
        {/if}
				<input
					type="radio"
					class="btn-check"
					value="IMAC"
					id="IMACDisplay"
					bind:group={boxDisplay}
				/>
				<label class="btn btn-outline-secondary btn-sm" for="IMACDisplay">IMAC</label>
				<input type="radio" class="btn-check" value="IAC" id="IACDisplay" bind:group={boxDisplay} />
				<label class="btn btn-outline-secondary btn-sm" for="IACDisplay">IAC/CIVA</label>
			</div>
		</div>
		{#if $flight!.source!.kind === 'bin'}
			<BoxReader
				target={($flight!.source.rawData as BinData).findOrigin()}
				origin={newOrigin!}
				onorigin={(neworigin: Origin) => (newOrigin = neworigin)}
				siteInputMode={newOrigin ? 'ph' : 'fcsites'}
			/>
		{:else if $flight!.source!.kind === 'acrowrx' && boxDisplay === 'IAC'}
			<p>
				The position of the box has been taken from Acrowrx, but all judging in FCScore is performed
				with a base height of 100m. You can shift the flight vertically to fit the 100m base height
				using the input below if necessary.
			</p>
			<div class="row mb-2">
				<label class="col col-form-label" for="z_shift">Z Shift (m):</label>
				<input
					id="z_shift"
					class="col col-form-input form-control"
					type="number"
					bind:value={shiftz}
					step="10"
				/>
			</div>
		{/if}

		<div class="row px-2">
			<button
				class="col btn btn-outline-secondary"
				onclick={() => {
					newOrigin = $flight!.origin;
				}}
			>
				Reset
			</button>
			<button class="col btn btn-outline-primary" onclick={()=>{
        $flight = new Flight(
          $flight!.source!.shift_z(shiftz),
          newOrigin,
          newStates,
          $flight?.splitting
        );
        shiftz = 0;
        goto(resolve('/flight/create/manoeuvres'));
      }}>Next</button>
		</div>
	{/snippet}

	{#snippet main()}
		{#if display === 'map' && $flight!.source.rawData instanceof BinData}
			<MapPlot bind:origin={newOrigin} bind:binData={$flight!.source.rawData} />
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
