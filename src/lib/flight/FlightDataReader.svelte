<script lang="ts">
	import { BinData, BinReader } from './bin';
	import { FCJson } from '$lib/flight/fcjson';
	import { States } from '$lib/utils/state';
	import { dbServer } from '$lib/api/api';
  
	export let binData: BinData | undefined;
	export let bin: File | undefined;
	export let bootTime: Date | undefined;
	export let fcj: FCJson | undefined;
	export let states: States | undefined;
	export let inputMode = 'bin';
	export let isDuplicate: boolean = false;
  export let onBeforeLoad: () => void;
	let md5: string | undefined = undefined;
	let files: FileList | undefined;

	const inputNames: Record<string, string> = {
		bin: 'bin file',
		fcj: 'fc json file',
		state: 'state csv'
	};

	$: if (inputMode) {
		files = undefined;
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
</script>

<div class="row p-2">
	<label class="col col-form-label" for="data-input-mode">Data Source:</label>
	<select class="col col-form-input form-select" id="data-input-mode" bind:value={inputMode}>
		{#each Object.entries(inputNames) as [k, v]}
			<option value={k}>{v}</option>
		{/each}
	</select>
</div>

<div class="row p-2">
	<label class="col col-form-label" for="data-input-file">Load {inputMode} File:</label>
	<div class="col col-form-input" style:overflow="hidden" id="data-file-input">
		{#if inputMode === 'bin'}
			<BinReader
        bin={bin}
				onloaded={(...data) => {
          onBeforeLoad();
					[bin, binData, bootTime, md5] = data;
					dbServer
						.get(`flight/check_duplicate/${md5}`)
						.then(r => {
              isDuplicate = r.statusText != 'OK';
            })
						.catch(e => {
							console.debug(e);
              isDuplicate = true;
						});
				}}
			/>
		{:else if inputMode === 'fcj' || inputMode === 'state'}
			<label
				for="fcjfile"
				class="btn btn-outline-secondary form-control text-nowrap"
				style:overflow="hidden"
			>
				{#if (inputMode=='fcj' && fcj) ||  (files && files.length > 0)}
					{fcj?.name || (files && files[0].name)}
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
            onBeforeLoad();
						parseFile(files[0]);
					}
				}}
			/>
		{/if}
	</div>
</div>
