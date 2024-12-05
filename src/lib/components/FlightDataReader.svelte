<script lang="ts">
	import { BinData, BinReader} from '$lib/components/bin';
	import { FCJson } from '$lib/analysis/fcjson';
	import { States } from '$lib/analysis/state';
	import { dbServer } from '$lib/api';

	export let binData: BinData | undefined;
	export let bin: File | undefined;
	export let bootTime: Date | undefined;
	export let fcj: FCJson | undefined;
	export let states: States | undefined;
	export let inputMode = 'bin';
	let md5: string | undefined = undefined;
	let files: FileList | undefined;
  
	const inputNames: Record<string, string> = {
		bin: 'bin file',
		fcj: 'fc json file',
		state: 'state csv'
	};

  $: if (inputMode) {
    files=undefined;
    md5 = undefined;
  }

	const parseFile = (file: File) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			if (inputMode === 'state') {
				states = States.read_csv(reader.result as string);
			} else {
				fcj = FCJson.parse(JSON.parse(reader.result! as string));
        states = States.from_fcj(fcj);
			}
		};
		reader.readAsText(file);
	};

	const checkCanUpload = (binFile: File) => {
		dbServer
			.get(`flight/check_duplicate/${md5}`)
			.then(() => {
				bin = binFile;
			})
			.catch((e) => {
				bin = undefined;
				console.log(e);
			});
	};
</script>

<div class="row pt-3">
	<label class="col" for="data-input-mode">Select Data Source:</label>
  <select class="col form-select" id="data-input-mode" bind:value={inputMode}>
		{#each Object.entries(inputNames) as [k, v]}
			<option value={k}>{v}</option>
		{/each}
  </select>
</div>

<div class="row pt-3">
  <label class="col" for="data-input-file">Load {inputMode} File:</label>
	<div class="col" style:overflow="hidden" id="data-file-input">
		{#if inputMode === 'bin'}
			<BinReader
				onloaded={(...data) => {
					let tempbin: File | undefined;
					let tempBD: BinData | undefined;
					[tempbin, tempBD, bootTime, md5] = data;
					checkCanUpload(tempbin!);
					binData = tempBD;
				}}
			/>
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
				on:change={() => {
					if (files && files.length) {
						parseFile(files[0]);
					}
				}}
			/>
		{/if}
	</div>
  
</div>
