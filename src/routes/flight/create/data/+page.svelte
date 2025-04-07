<script lang="ts">
	import { binData, origin, fcj, bin, bootTime, states, manSplits } from '$lib/stores/analysis';
	import { clearDataLoading } from '$lib/flight/analysis';
	import { dataSource, isFullSize } from '$lib/stores/shared';
	import FlightDataReader from '$lib/flight/FlightDataReader.svelte';
	import { BoxReader } from '$lib/flight/box';
	import { MapPlot } from '$lib/plots/map';
	import PlanViewPlot from '$lib/plots/PlanViewPlot.svelte';
	import { base } from '$app/paths';
	import { GPS } from '$lib/utils/geometry';
	import { States } from '$lib/utils/state';
	import { goto } from '$app/navigation';
	import { parseFCJMans, loadManDefs } from '$lib/flight/splitting';
	import { Origin } from '$lib/flight/fcjson';
	import BinReader from '$lib/flight/bin/BinReader.svelte';
	import { dbServer } from '$lib/api';
	import { Point } from '$lib/utils/geometry';

	let inputMode: 'bin' | 'fcj' | 'state' | 'acrowrx' = $state('bin');
	let siteInputMode: 'fcsites' | 'fcj' | 'pc' | 'ph' = $state('ph');
	let form_state: string | undefined = $state();
	let box_state: string | undefined = $state();

	const reset = () => {
		clearDataLoading();
		form_state = undefined;
		box_state = undefined;
	};

	const checkOrigin = (newOrigin: Origin | undefined = undefined, fix: boolean) => {
		//return a new Origin and warn in box_state
		//if fix is true an attemt will be made to fix the origin.
		const target = $binData?.findOrigin();

		if (newOrigin) {
			const dist = GPS.sub(target!, newOrigin.pilot);
			const distxy = Math.sqrt(dist.x ** 2 + dist.y ** 2);

			if (distxy > 200) {
				box_state = `Pilot position is ${(distxy / 1000).toFixed(2)}km from bin origin.`;

				if (fix) {
					box_state = box_state + ' Setting pilot position to bin origin.';
					siteInputMode = 'fcsites';
					return new Origin(target!.lat, target!.lon, target!.alt, newOrigin.heading);
				} else {
					return newOrigin;
				}
			}

			if (Math.abs(dist.z) > 20) {
				box_state = `Box elevation = ${newOrigin.alt}, bin origin altitude = ${target!.alt}, shifting box to origin altitude.`;

				if (fix) {
					siteInputMode = 'fcsites';
					box_state = box_state + ' Setting pilot altitude to bin origin.';
					return new Origin(newOrigin.lat, newOrigin.lng, target!.alt, newOrigin.heading);
				} else {
					return newOrigin;
				}
			}
			if (fix) {
				siteInputMode = 'ph';
			}

			box_state = undefined;
			return newOrigin;
		} else {
			box_state = 'Box initialised on bin origin.';
			return new Origin(target!.lat, target!.lon, target!.alt, 0);
		}
	};

	const inputModes: Record<string, string> = {
		bin: 'Ardupilot Bin file',
		fcj: 'FC json file',
		state: 'State csv file',
		acrowrx: 'Acrowrx file'
	};

	let shiftx = $state(0);
	let shifty = $state(0);
	let shiftz = $state(0);
</script>

<div class="col-md-4 pt-3 bg-light border">
	<small>Load Flight Data</small>

	<div class="row p-2">
		<label class="col col-form-label" for="data-input-mode">Data Source:</label>
		<select
			class="col col-form-input form-select"
			id="data-input-mode"
			bind:value={inputMode}
			onchange={reset}
		>
			{#each Object.entries(inputModes) as [k, v]}
				<option value={k}>{v}</option>
			{/each}
		</select>
	</div>

	<div class="row p-2">
		<label class="col col-form-label" for="data-input-mode">{inputModes[inputMode]}:</label>
		<div class="col col-form-input" style:overflow="hidden" id="data-file-input">
			{#if inputMode == 'bin'}
				<BinReader
					bin={$bin}
					onloaded={(...data) => {
						reset();
						let md5: string;
						[$bin, $binData, $bootTime, md5] = data;
						dbServer
							.get(`flight/check_duplicate/${md5}`)
							.then((r) => {
								return r.statusText != 'OK';
							})
							.catch((e) => {
								return true;
							})
							.then((isDuplicate) => {
								if (isDuplicate) {
									form_state =
										'This bin file already exists on the server, You can analyse the flight but you wont be able to upload it.';
									$bin = undefined;
								}
							});
						$origin = checkOrigin($origin, true);
					}}
				/>
			{:else}
				<FlightDataReader
					bind:inputMode
					onloaded={(_fcj, _states) => {
						reset();
						$fcj = _fcj;
						$states = _states;
            shiftx = 0;
            shifty = 0;
            shiftz = 0;
						$origin = $fcj?.origin || $origin;
						form_state = `You can can analyse a ${inputMode} file but you wont be able to upload it. Please use an Ardupilot bin file if possible.`;
					}}
				/>
			{/if}
		</div>
	</div>

	{#if form_state}
		<div class="row mt-4">
			<p><mark>{form_state}</mark></p>
		</div>
	{/if}
	<hr />

	{#if $binData && $origin}
		<small>Define The Box</small>
		<BoxReader
			target={$binData.findOrigin()}
			origin={$origin}
			onorigin={(newOrigin: Origin) => ($origin = checkOrigin(newOrigin, false))}
			onfcj={(newFCJ) => ($fcj = newFCJ)}
			bind:siteInputMode
		/>
		{#if box_state}
			<div class="row mt-4">
				<p><mark>{box_state}</mark></p>
			</div>
		{/if}
		<hr />
	{/if}

	{#if inputMode=="acrowrx" && $states}
    <p>Shift Box:</p>
    <table class="table table-sm text-center">
			<tbody>
				<tr>
					<td>X</td>
					<td>Y</td>
					<td>Z</td>
				</tr>
				<tr>
					<td class="p-0"
						><input class="form-control w-100 text-center" type="number" bind:value={shiftx} step="10" /></td
					>
					<td class="p-0"
						><input class="form-control w-100  text-center" type="number" bind:value={shifty} step="10" /></td
					>
					<td class="p-0"
						><input class="form-control w-100 text-center" type="number" bind:value={shiftz} step="10" /></td
					>
				</tr>
			</tbody>
		</table>
	{/if}

	{#if ($binData && $origin) || $states}
		<div class="row">
			<button class="btn btn-outline-primary col mx-2" onclick={clearDataLoading}>Clear</button>
			<button
				id="select-manoeuvres"
				class="btn btn-outline-primary col mx-2"
				onclick={async () => {
					$dataSource = inputMode;
					if ($origin) {
						$origin.save();
					}
					if ($binData && $origin) {
						$states = States.from_xkf1($origin, $binData.orgn, $binData.xkf1);
					}

          $states = $states!.shift(new Point(shiftx, shifty, shiftz));
          shiftx = 0;
          shifty = 0;
          shiftz = 0;
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
		<PlanViewPlot shiftx={shiftx} shifty={shifty} shiftz={shiftz} />
	{/if}
</div>
