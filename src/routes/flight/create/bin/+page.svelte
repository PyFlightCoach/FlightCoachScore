<script lang="ts">
	import * as fcj from '$lib/flight/fcjson';
	import BINWorker from '$lib/JsDataflashParser/parser.js?worker';
	import { BinData, BinField } from '$lib/flight/bin/bindata';
	import { cat } from '$lib/utils/files';
	import { md5 } from 'js-md5';
	import { loading } from '$lib/stores/shared';
	import { activeFlight } from '$lib/stores/shared';
	import { FlightDataSource } from '$lib/flight/flight';
	import { States } from '$lib/utils/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { GPS } from '$lib/utils/geometry';
	import { Splitting } from '$lib/flight/splitting';
	import { checkDuplicate, importAnalysis, loadAnalysisFromDB } from '$lib/flight/analysis';
	import type { AJson } from '$lib/flight/ajson';
	import { prettyPrintHttpError } from '$lib/utils/text';

	let fcjFile: File | undefined = $state();
	let fcjson: fcj.FCJson | undefined = $state();

	let filename: string | undefined = $state();
	let bin: File | undefined = $state();
	let binData: BinData | undefined = $state();
	let bootTime: Date | undefined = $state();

	let duration = $derived(binData ? binData.att?.time_boot_s[binData.att?.length - 1] / 60 : 0);
	let binOrigin = $derived(binData ? fcj.Origin.from_centre(binData?.findOrigin()) : undefined);

	let localStorageOrigin = $derived.by(() => {
		const local = fcj.Origin.load();
		if (binOrigin && local && GPS.sub(binOrigin.pilot, local.pilot).length() < 300) {
			return local;
		} else {
			return undefined;
		}
	});

	let fcjDuration = $derived(fcjson ? fcjson.data[fcjson.data.length - 1].time / 1000000 / 60 : 0);

	let origin = $derived(fcjson?.origin.noMove() || localStorageOrigin || binOrigin);

	let states = $derived(
		origin && binData ? States.from_xkf1(origin, binData.orgn, binData.xkf1) : undefined
	);

	let loadSegmentation = $derived(
		fcjson && states ? Splitting.parseFCJ(fcjson, states) : Splitting.default()
	);
</script>

<div class="container-auto py-4" style="max-width: 800px;">
	<div class="container border rounded">
		<div class="row px-1 mb-1">
			<label for="bin-file-input" class="col col-form-label">Select Ardupilot BIN File:</label>
			<input
				id="binfile"
				class="col-auto form-control mt-1"
				style="max-width:400px;"
				type="file"
				accept=".bin, .BIN"
				bind:value={filename}
				onchange={async (e: Event) => {
					const file = (e.target as HTMLInputElement).files?.item(0) || undefined;

					if (file) {
						$loading = true;
						cat(file, 'readAsArrayBuffer')
							.then((buf) => checkDuplicate(md5(buf as ArrayBuffer)))
							.then(() => {
								const worker = new BINWorker();
								let _bootTime: Date | undefined = undefined;
								let _binData: BinData | undefined = new BinData({});

								worker.onmessage = (event) => {
									if (event.data.hasOwnProperty('messageType')) {
										_binData![event.data.messageType as keyof BinData] = new BinField(
											event.data.messageList
										);
									} else if (event.data.hasOwnProperty('metadata')) {
										_bootTime = new Date(Date.parse(event.data.metadata.bootTime));
									} else if (event.data.hasOwnProperty('messagesDoneLoading')) {
										bin = file;
										binData = _binData;
										bootTime = _bootTime;
										$loading = false;
									}
								};

								let reader = new FileReader();

								reader.onload = () => {
									worker.postMessage({
										action: 'parse',
										file: reader.result,
										msgs: ['POS', 'ATT', 'XKF1', 'XKF2', 'IMU', 'GPS', 'GPA', 'ORGN']
									});
								};

								reader.readAsArrayBuffer(file);
							})
							.catch((e) => {
								filename = '';
								bin = undefined;
								binData = undefined;
								bootTime = undefined;
								console.error(e);
								alert(prettyPrintHttpError(e));
							})
							.finally(() => {
								$loading = false;
							});
					}
				}}
			/>
		</div>

		{#if bin}
			<div class="row text-nowrap">
				<div class="col"></div>
				<div class="col">
					<small>Boot Time: {bootTime?.toLocaleString()}</small>
					<br />
					<small
						>Duration: {Math.floor(duration)} minutes {(duration % 60).toFixed(0)} seconds</small
					>
					<br />
					<small
						>Origin:
						{binOrigin?.lat.toFixed(3)},
						{binOrigin?.lng.toFixed(3)},
						{binOrigin?.alt.toFixed(2)}
					</small>
				</div>
			</div>
		{/if}
	</div>
	{#if bin}
		<div class="mt-1 container border rounded">
			<p>
				OPTIONAL: If a flight coach json file is included the box and manoeuvre splitting can be loaded from
				it. This can also be set up manually within FCScore.
			</p>

			<div class="row px-1 mb-1">
				<label for="fcj_file" class="col col-form-label">Select Flight Coach JSON File:</label>
				<input
					id="fcj_file"
					class="col-auto form-control"
					style="max-width:400px;"
					type="file"
					accept=".json, .f3a, .F3A"
					onchange={(e) => {
						fcjFile = (e.target as HTMLInputElement).files?.item(0) || undefined;
						if (fcjFile) {
							const reader = new FileReader();
							reader.onload = () => {
								fcjson = fcj.FCJson.parse(JSON.parse(reader.result as string));
							};
							reader.readAsText(fcjFile);
						}
					}}
				/>
			</div>
			{#if fcjson}
				<div class="row text-nowrap">
					<div class="col"></div>
					<div class="col">
						<small
							>Duration: {Math.floor(fcjDuration)} minutes {(fcjDuration % 60).toFixed(0)} seconds</small
						>
						<br />
						<small
							>Origin:
							{fcjson?.origin.lat.toFixed(3)},
							{fcjson?.origin.lng.toFixed(3)},
							{fcjson?.origin.alt.toFixed(2)},
							{(fcjson?.origin.heading).toFixed(2)}&deg;
						</small>
					</div>
				</div>
			{/if}
		</div>

		<div class="row mt-1 px-3">
			<div class="col"></div>
			{#await loadSegmentation then segmentation}
				<button
					class="col btn btn-outline-primary"
					onclick={() => {
						$activeFlight = new FlightDataSource(
							bin,
							'bin',
							undefined,
							bootTime,
							binData,
							origin,
							segmentation,
              segmentation.schedule,
						);
						goto(resolve('/flight/create/box'));
					}}
				>
					Next
				</button>
			{/await}
		</div>
	{/if}
</div>
