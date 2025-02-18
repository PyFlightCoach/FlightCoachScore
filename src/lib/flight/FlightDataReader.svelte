<script lang="ts">
	import { FCJson } from '$lib/flight/fcjson';
	import { State, States } from '$lib/utils/state';

	let {
		inputMode = $bindable('fcj'),
		fcj = undefined,
		states = undefined,
		onloaded = () => {}
	}: {
		inputMode?: 'fcj' | 'state';
		fcj?: FCJson;
		states?: States;
		onloaded: (fcj: FCJson | undefined, states: States) => void;
	} = $props();

	let files: FileList | undefined = $state();

	const parseFile = (file: File) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			if (inputMode === 'state') {
				states = States.read_csv(reader.result as string);
				onloaded(undefined, states);
			} else {
				fcj = FCJson.parse(JSON.parse(reader.result! as string));
				states = States.from_fcj(fcj);
				onloaded(fcj, states);
			}
		};
		reader.readAsText(file);
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
	accept={inputMode === 'fcj' ? '.json' : '.csv'}
	bind:files
	style="display:none"
	onchange={() => {
		if (files && files.length) {
			parseFile(files[0]);
		}
	}}
/>
