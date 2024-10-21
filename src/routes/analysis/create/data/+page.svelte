<script lang="ts">
	import BINWorker from '$lib/JsDataflashParser/parser.js?worker';
	import pkg from 'file-saver';
	import { BinData, BinField } from '$lib/analysis/bindata';
	import { binData, bin, bootTime } from '$lib/stores/analysis';
	import { base } from '$app/paths';
	const { saveAs } = pkg;

	const worker = new BINWorker();

	let files: FileList;

	let ready: boolean = true;
	let availableMessages: Record<string, any>;
	let loadedMessages: Record<string, boolean> = {};
	let percent: number;
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
			$binData[event.data.messageType] = new BinField(event.data.messageList);
			loadedMessages[lname] = true;
		} else if (event.data.hasOwnProperty('metadata')) {
			$bootTime = new Date(Date.parse(event.data.metadata.bootTime));
		} else if (event.data.hasOwnProperty('messagesDoneLoading')) {
			ready = true;
		}
	};

	function parseMessages(msgs: string[]) {
		$binData = new BinData({});
		let reader = new FileReader();
		reader.onload = (e) => {
			let dat = reader.result;
			worker.postMessage({
				action: 'parse',
				file: dat,
				msgs: msgs
			});
		};
		reader.readAsArrayBuffer($bin!);
	}

	function parseBin(file: File) {
		if (file) {
			$bin = file;
			$binData = new BinData({});
			ready = false;
			loadedMessages = {};
			parseMessages(['POS', 'ATT', 'XKF1', 'XKF2', 'IMU', 'GPS', 'ORGN']);
		}
		ddopen = false;
	}

	function saveData() {
		saveAs(
			new Blob([JSON.stringify($binData)], { type: 'application/json' }),
			`${$bin!.name.split('.').slice(0, -1).join('.')}.json`
		);
	}
	function clearData() {
		$binData = undefined;
		$bin = undefined;
	}

	let ddopen = false;
</script>

<div class="container pt-5 ">
	{#if ready}
		<div id="binFile" class="input-group mb-3">
			{#if !$binData}
				<label class="form-control" >Load Ardupilot BIN File</label>
				<input class="form-control" type="file" accept=".bin, .BIN" bind:files />
				{#if files && files.length > 0}
					<button
						class="btn form-control btn-outline-primary"
						on:click={() => {
							parseBin(files[0]);
						}}>Load</button
					>
				{/if}
			{:else}
				<button class="form-control btn btn-outline-primary" on:click={clearData}>Clear</button>
				<button class="form-control btn btn-outline-primary" on:click={saveData}>Download</button>
				<a class="form-control btn btn-outline-primary" href={base + '/analysis/create/box'}>Next</a
				>
			{/if}
		</div>

		<div class="container pt-5">
			{#if $binData}
				<p>Loaded {$bin?.name || 'no file'}</p>
				<p>Boot time {$bootTime}</p>

				<table class="table table-bordered table-sm">
					<thead>
						<tr>
							<th>Name</th>
							<th>Length</th>
							<th colspan="100%">Fields</th>
						</tr>
					</thead>
					<tbody>
						{#each Object.entries($binData) as [name, field]}
							<tr>
								<td>{name}</td>
								<td>{field.length}</td>
								{#each Object.keys(field) as col}
									<td>{col}</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			{:else}
				<p>No data loaded</p>
			{/if}
		</div>
	{:else}
		<p>{percent?.toFixed(0) || 0}</p>
	{/if}
</div>
