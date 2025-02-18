<script lang="ts">
	import BINWorker from '$lib/JsDataflashParser/parser.js?worker';
	import { saveAs } from 'file-saver';
	import { BinData, BinField } from './bindata';
	import { md5 } from 'js-md5';
	const worker = new BINWorker();

	let binData: BinData | undefined = $state();
	let bootTime: Date | undefined = $state();
	let md5Sum: string | undefined = $state();
	let {
    bin = undefined,
		messages = $bindable(['POS', 'ATT', 'XKF1', 'XKF2', 'IMU', 'GPS', 'GPA', 'ORGN']),
		busy = $bindable(false),
		download = false,
		clear = false,
    loadOnChange = true,
		onloaded = () => {}
	}: {
    bin?: File;
		messages?: string[];
		busy?: boolean;
		download?: boolean;
		clear?: boolean;
    loadOnChange?: boolean;
		onloaded: (bin: File, binData: BinData, bootTime: Date, md5Sum: string) => void;
	} = $props();

	let files: FileList | undefined = $state();
	let availableMessages: Record<string, any> | undefined = $state();
	let loadedMessages: Record<string, boolean> = $state({});
	let percent: number | undefined = $state();

	worker.onmessage = (event) => {
		if (event.data.hasOwnProperty('availableMessages')) {
			availableMessages = event.data.availableMessages;
			Object.entries(event.data.availableMessages).forEach(([name, message]) => {
				const lname = name.split('[')[0];
				if (!loadedMessages.hasOwnProperty(lname)) {
					loadedMessages[lname] = false;
				}
			});
		} else if (event.data.hasOwnProperty('percentage')) {
			percent = event.data.percentage;
		} else if (event.data.hasOwnProperty('messageType')) {
			const lname = event.data.messageType.split('[')[0];
			binData![event.data.messageType as keyof BinData] = new BinField(event.data.messageList);
			loadedMessages[lname] = true;
		} else if (event.data.hasOwnProperty('metadata')) {
			bootTime = new Date(Date.parse(event.data.metadata.bootTime));
		} else if (event.data.hasOwnProperty('messagesDoneLoading')) {
			busy = false;
			onloaded(bin!, binData!, bootTime!, md5Sum!);
		}
	};

	async function parseMessages(msgs: string[]) {
		binData = new BinData({});
		let reader = new FileReader();

		reader.onload = () => {
			md5Sum = md5(reader.result as ArrayBuffer);
			worker.postMessage({
				action: 'parse',
				file: reader.result,
				msgs: $state.snapshot(msgs)
			});
		};
    
		reader.readAsArrayBuffer(bin!);
	}

	function parseBin(file: File) {
		if (file) {
			bin = file;
			binData = new BinData({});
			busy = false;
			loadedMessages = {};
			parseMessages(messages);
		}
		ddopen = false;
	}

	function saveData() {
		saveAs(
			new Blob([JSON.stringify(binData)], { type: 'application/json' }),
			`${bin!.name.split('.').slice(0, -1).join('.')}.json`
		);
	}
	function clearData() {
		binData = undefined;
		bin = undefined;
	}

  $effect(() => {if(bin) {files=undefined}})

	let ddopen = false;
</script>

{#if !busy}
	<label
		for="bininput"
		class="btn btn-outline-secondary form-control text-nowrap"
		style:overflow="hidden"
		>
    {bin?.name || (files && files[0].name) || 'Select File'}
  </label>
	<input
		id="bininput"
		class="form-control"
		type="file"
		accept=".bin, .BIN"
		bind:files
		style="display:none"
    onchange={()=>{
      if (loadOnChange && files && files.length) {parseBin(files[0])}
    }}
	/>
	{#if !loadOnChange && files && files.length > 0}
		<button
			class="btn form-control btn-outline-secondary"
			onclick={() => {if (files && files.length) {parseBin(files[0])}}}
    >
      Load
    </button
		>
	{/if}
	{#if !binData}
		{#if clear}
			<button class="form-control btn btn-outline-secondary" onclick={clearData}>Clear Bin</button>
		{/if}
		{#if download}
			<button class="form-control btn btn-outline-secondary" onclick={saveData}>Download</button>
		{/if}
	{/if}
{:else}
	<span class="form-control">{percent?.toFixed(0) || 0}</span>
{/if}
