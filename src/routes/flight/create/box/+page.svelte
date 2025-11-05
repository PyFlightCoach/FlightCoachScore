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

	let newOrigin = $state($activeFlight!.origin );
	
  let newStates = $derived($activeFlight!.statesAtNewOrigin(newOrigin!));

  $inspect(newOrigin);

	let boxDisplay: 'F3A' | 'IMAC' | 'IAC' = $state($activeFlight?.kind === 'acrowrx' ? 'IAC' : 'F3A');
	let display: 'map' | 'state' = $state($activeFlight!.origin ? 'state' : 'map');

  $effect(() => {
    $isFullSize = boxDisplay === 'IAC';
  });
  
</script>

<SideBarLayout sideBarWidth={4}>
	{#snippet side()}
		<div class="row">
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
				<label class="btn btn-outline-secondary btn-sm" for="stateDisplay">3D</label>
			</div>

			<label for="boxOptions" class="col-auto col-form-label">Box:</label>
			<div id="boxOptions" class="col mb-2 py-2 btn-group">
				{#if $activeFlight!.kind !== 'acrowrx'}
					<input
						type="radio"
						class="btn-check"
						value="F3A"
						id="F3ADisplay"
						bind:group={boxDisplay}
					/>
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
		{#if $activeFlight!.kind === 'bin'}
			<BoxReader
				target={($activeFlight!.rawData as BinData).findOrigin()}
				origin={newOrigin!}
				onorigin={(neworigin: Origin) => (newOrigin = neworigin)}
				siteInputMode={newOrigin ? 'ph' : 'fcsites'}
			/>
		{:else if $activeFlight!.kind === 'acrowrx' && boxDisplay === 'IAC'}
			<p>
				The position of the box has been taken from Acrowrx, but all judging in FCScore assumes a
        base height of 100m. You can shift the box vertically to suit your using the input below. 
			</p>
			<div class="row mb-2">
				<label class="col col-form-label" for="z_shift">Z Shift (m):</label>
				<input
					id="z_shift"
					class="col col-form-input form-control"
					type="number"
					step="10"
					value={0}
					onchange={(e) => {
						const val = parseFloat((e.target as HTMLInputElement).value);
						if (!isNaN(val)) {
							const oldOrigin: Origin = $activeFlight!.origin!;
							newOrigin = new Origin(
								oldOrigin!.lat,
								oldOrigin!.lng,
								oldOrigin!.alt + val,
								oldOrigin!.heading
							);
						}
					}}
				/>
			</div>
		{/if}

		<div class="row px-2">
			<button
				class="col btn btn-outline-secondary"
				onclick={() => {
					newOrigin = $activeFlight!.origin;
				}}
			>
				Reset
			</button>
			<button
				class="col btn btn-outline-primary"
				onclick={() => {
					$activeFlight = $activeFlight!.withNewOrigin(newOrigin!);

					goto(resolve('/flight/create/manoeuvres'));
				}}>Next</button
			>
		</div>
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
