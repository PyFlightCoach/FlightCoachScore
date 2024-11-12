<script lang="ts">
	import { binData, bin, bootTime, fcj, states } from '$lib/stores/analysis';
	import { BinData, BinReader, FieldInfo } from '$lib/components/bin';
	import { base } from '$app/paths';
	import ToggleButton from '$lib/components/ToggleButton.svelte';
	import { onMount } from 'svelte';
	import { FCJson } from '$lib/analysis/fcjson';
	import { States, State, type St } from '$lib/analysis/state';
	import { dbServer } from '$lib/api';

	let _md5: string | undefined = undefined;
	let _bin: File | undefined = undefined;
	let _binData: BinData | undefined = undefined;
	let _bootTime: Date | undefined = undefined;

	let _fcj: FCJson | undefined = undefined;
	let _states: States | undefined = undefined;
	let getmans: boolean = true;
	let files: FileList;
	let form_state: string | undefined;

	let inputMode = 'bin';
	const inputNames: Record<string, string> = {
		bin: 'bin file',
		fcj: 'fc json file',
		state: 'state csv'
	};

	$: if (inputMode) {
		_md5 = undefined;
		_bin = undefined;
		_binData = undefined;
		_bootTime = undefined;
		_fcj = undefined;
		if (inputMode != 'bin') {
			form_state = `You can can analyse a ${inputNames[inputMode]} but you wont be able to upload it. Please use an Ardupilot bin file if possible.`;
		} else {
			form_state = undefined;
		}
	}

	const parseFile = (file: File) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			if (inputMode === 'state') {
				let cols: string[];
				_states = new States([]);

				(reader.result as string)!.split('\n').forEach((line: string) => {
					if (!cols) {
						cols = line.split(',');
					} else {
						_states!.data.push(
							new State(
								Object.fromEntries(
									line.split(',').map((val, i) => [cols[i], Number(val)])
								) as unknown as St
							)
						);
					}
				});
			} else {
				_fcj = FCJson.parse(JSON.parse(reader.result! as string));
			}
		};
		reader.readAsText(file);
	};

	const checkCanUpload = (binFile: File) => {
		const fd = new FormData();
		fd.append('bin-md5sum', _md5);
		dbServer
			.post('check-file-duplicate', fd)
			.then(() => {
				_bin = binFile;
				form_state = undefined;
			})
			.catch((e) => {
				_bin = undefined;
				form_state =
					'Bin file already exists on the server, You can analyse the flight but you wont be able to upload it.';
				console.log(e);
			});
	};

	onMount(() => {
		binData.set(undefined);
		bin.set(undefined);
		bootTime.set(undefined);
		states.set(undefined);
		fcj.set(undefined);
	});
</script>

<div class="col-lg-5 pt-5">
	<form class="input-group">
		<button
			class="btn btn-outline-secondary dropdown-toggle form-control-sm"
			type="button"
			data-bs-toggle="dropdown"
			aria-expanded="false"
		>
			{inputNames[inputMode] || 'Select Input Mode'}
		</button>
		<ul class="dropdown-menu">
			{#each Object.entries(inputNames) as [k, v]}
				<li><ToggleButton bind:group={inputMode} value={k}>{v}</ToggleButton></li>
			{/each}
		</ul>
		{#if inputMode === 'bin'}
			<BinReader
				onloaded={(...data) => {
					let tempbin: File | undefined = undefined;
					[tempbin, _binData, _bootTime, _md5] = data;
					checkCanUpload(tempbin!);
				}}
			/>
			{#if _bin && _binData && _bootTime && _md5}
				<a
					type="button"
					href={base + '/flight/create/box'}
					class="btn btn-outline-primary form-control"
					on:click={() => {
						$bin = _bin;
						$binData = _binData;
						$bootTime = _bootTime;
					}}
				>
					Next
				</a>
			{/if}
		{:else if inputMode === 'fcj' || inputMode === 'state'}
			<label
				for="fcjfile"
				class="btn btn-outline-secondary form-control text-nowrap"
				style:overflow="hidden"
			>
				{#if files && files.length > 0}
					{files[0].name}
				{:else}
					Select File
				{/if}
			</label>
			<input
				id="fcjfile"
				class="form-control"
				type="file"
				accept={inputMode === 'fcj' ? '.json' : '.csv'}
				bind:files
				style="display:none"
			/>
			{#if files && files.length > 0}
				<button
					class="btn btn-outline-secondary form-control"
					on:click={() => {
						parseFile(files[0]);
					}}
				>
					Load
				</button>
			{/if}
			{#if _fcj}
				<div class="input-group-text">
					<input
						id="getmans"
						class="form-check-input mt-0"
						type="checkbox"
						bind:checked={getmans}
						aria-label="Parse manoeuvre split locations from FC json"
					/>
					<label for="getmans" class="form-check-label">Include Manoeuvres</label>
				</div>
			{/if}
			{#if _states || _fcj}
				<a
					type="button"
					href={base + '/flight/create/manoeuvres'}
					class="btn btn-outline-primary form-control"
					data-sveltekit-preload-data="false"
					on:click={() => {
						$fcj = _fcj;
						$states = _states;
					}}
				>
					Next
				</a>
			{/if}
		{/if}
		{#if form_state}
			<div class="row mt-4">
				<p><mark>{form_state}</mark></p>
			</div>
		{/if}
	</form>

	{#if inputMode === 'bin' && _binData}
		<FieldInfo bind:binData={_binData} />
	{/if}
</div>
