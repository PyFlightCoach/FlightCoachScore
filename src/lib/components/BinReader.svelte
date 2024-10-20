<script lang="ts">
	import NavMenu from '$lib/components/NavMenu.svelte';
	import SubMenu from '$lib/components/SubMenu.svelte';
	import BINWorker from '$lib/JsDataflashParser/parser.js?worker';
	import pkg from 'file-saver';
	import { createEventDispatcher } from 'svelte';
	import { BinData, BinField } from '$lib/analysis/bindata';

	const dispatch = createEventDispatcher();

	const { saveAs } = pkg;

	const worker = new BINWorker();

	let data: BinData;
	let file: File;

	let ready: boolean = false;
	let availableMessages: Record<string, any>;
	let loadedMessages: Record<string, boolean> = {};
	let bootTime: Date;
	export let selectFields: boolean = false;
	export let showColumns: boolean = false;
	export let exportData: boolean = false;

	worker.onmessage = (event) => {
		if (event.data.hasOwnProperty('availableMessages')) {
			availableMessages = event.data.availableMessages;
			Object.entries(event.data.availableMessages).forEach(([name, message]) => {
				const lname = name.split('[')[0];
				if (!loadedMessages.hasOwnProperty(lname)) {
					loadedMessages[lname] = false;
				}
			});
		} else if (event.data.hasOwnProperty('messageType')) {
			const lname = event.data.messageType.split('[')[0];
			data[event.data.messageType] = new BinField(event.data.messageList);
			loadedMessages[lname] = true;
		} else if (event.data.hasOwnProperty('metadata')) {
			bootTime = new Date(Date.parse(event.data.metadata.bootTime));
		} else if (event.data.hasOwnProperty('messagesDoneLoading')) {
			ready = true;
			dispatch('loaded', { data, file, bootTime });
		}
	};

	function parseMessages(msgs: string[]) {
		data = new BinData({});
		let reader = new FileReader();
		reader.onload = (e) => {
			let dat = reader.result;
			worker.postMessage({
				action: 'parse',
				file: dat,
				msgs: msgs
			});
		};
		reader.readAsArrayBuffer(file);
	}

	function loadOrDelMsg(load: boolean, name: string) {
		if (load) {
			if (!data[name]) {
				parseMessages([name]);
			}
		} else {
			let names: string[] = [];
			Object.keys(data).forEach((n) => {
				if (n.startsWith(name)) {
					names.push(n);
				}
			});
			names.forEach((n) => {
				if (data[n]) {
					delete data[n];
				}
			});
			loadedMessages[name] = false;
			data = data;
		}
	}

	function handleFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			file = input.files[0];
			data = new BinData({});
			ready = false;
			loadedMessages = {};
			parseMessages(['POS', 'ATT', 'XKF1', 'XKF2', 'IMU', 'GPS', 'ORGN']);
		}
		ddopen = false;
	}

	function saveData() {
		saveAs(
			new Blob([JSON.stringify(data)], { type: 'application/json' }),
			`${file!.name.split('.').slice(0, -1).join('.')}.json`
		);
	}
	function clearData() {
		dispatch('clear');
		data = undefined;
		file = undefined;
	}

	let ddopen = false;
</script>

<NavMenu>
	<span slot="icon">{file ? file.name : 'Bin'}</span>
	{#if !file}
		<div class="dropdown-item">
			<input type="file" accept=".bin, .BIN" on:change={handleFileChange} />
		</div>
	{:else}
		{#if selectFields}
			<SubMenu>
				<span slot="icon">Select Fields</span>
				<div class="dropdown-menu megamenu">
					<div class="selmsgs">
						{#each Object.entries(loadedMessages) as [name, loaded]}
							<div>
								<input
									type="checkbox"
									bind:checked={loaded}
									on:change={(e) => {
										loadOrDelMsg(e.target.checked, name);
									}}
								/>
							</div>
						{/each}
					</div>
				</div>
			</SubMenu>
		{/if}
		{#if showColumns}
			<SubMenu>
				<span slot="icon">Show Field Columns</span>
				<li class="minfo megamenu">
					<h3>Field</h3>
					<h3>Length</h3>
					<h3>Columns</h3>
					{#each Object.entries(data) as [name, msg]}
						<div>{name}</div>
						<div>{msg.time_boot_s ? msg.time_boot_s.length : 0}</div>
						<div>{Object.keys(msg)}</div>
					{/each}
				</li>
			</SubMenu>
		{/if}
		{#if exportData}
			<button class="dropdown-item" on:click={saveData}>Export Data</button>
		{/if}
		<button class="dropdown-item" on:click={clearData}>Clear</button>
	{/if}
</NavMenu>

<style>
	h3 {
		font-weight: bold;
	}
	.minfo {
		display: grid;
		grid-column-gap: 10px;
		grid-template-columns: max-content max-content 100%;
		background-color: white;
	}
	.selmsgs {
		display: grid;
		grid-gap: 5px;
		grid-template-columns: repeat(7, 1fr);
	}
</style>
