<script lang="ts">
	import { FCJson, Origin } from '$lib/flight/fcjson';
	import { State, States } from '$lib/utils/state';
	import { analysisServer } from '$lib/api';
	import { blockProgress, unblockProgress } from '$lib/stores/shared';
	import { bootTime } from '$lib/stores/analysis';

	let {
		inputMode = $bindable('fcj'),
		fcj = undefined,
		states = undefined,
		onloaded = () => {}
	}: {
		inputMode?: 'fcj' | 'state' | 'acrowrx';
		fcj?: FCJson;
		states?: States;
		onloaded: (
			states: States,
			fcj?: FCJson | undefined,
			bin?: File | undefined,
			bootTime?: Date | undefined,
			origin?: Origin | undefined
		) => void;
	} = $props();

	let files: FileList | undefined = $state();

	const parseFile = (file: File) => {
		if (inputMode == 'acrowrx') {
			const fd = new FormData();
			fd.append('acrowrx_file', file);
			analysisServer
				.post('/read_acrowrx', fd, {
					headers: {
						'Content-Type': 'multipart/form-data'
					}
				})
				.then((response) => {
					states = States.parse(response.data.data);
					onloaded(
						states,
						undefined,
						file,
						new Date(response.data.boot_time),
						Object.setPrototypeOf( response.data.origin, Origin.prototype)
					);
				})
				.finally(unblockProgress);
		} else {
			const reader = new FileReader();
			reader.onload = (e) => {
				switch (inputMode) {
					case 'state':
						states = States.read_csv(reader.result as string);
						onloaded(states);
						break;
					case 'fcj':
						fcj = FCJson.parse(JSON.parse(reader.result! as string));
						states = States.from_fcj(fcj);
						onloaded(states, fcj, undefined, undefined, fcj.origin);
						break;
				}
			};
			reader.readAsText(file);
		}
	};
</script>

<label
	for="fcjfile"
	class="btn btn-outline-secondary form-control text-nowrap"
	style:overflow="hidden"
>
	{#if (inputMode == 'fcj' && fcj) || (files && files.length > 0)}
		{fcj?.name || (files && files[0].name)}
	{:else}
		Select File
	{/if}
</label>
<input
	id="fcjfile"
	class="form-control"
	type="file"
	accept={{ fcj: '.json', state: '.csv', acrowrx: '' }[inputMode]}
	bind:files
	style="display:none"
	onchange={() => {
		if (files && files.length) {
			parseFile(files[0]);
		}
	}}
/>
