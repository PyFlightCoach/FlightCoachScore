<script lang="ts">
	import { FCJson, Origin } from '$lib/flight/fcjson';

	let {
		onorigin = () => {},
    onfcj = () => {}
	}: {
		onorigin?: (origin: Origin) => void;
    onfcj?: (fcjson: FCJson) => void;
	} = $props();

	let files: FileList | undefined = $state();

	const loadBoxFile = (file: File) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const _norg = Origin.parseF3aZone(reader.result as string);
			if (_norg) {
        onorigin(_norg);
			} else {
				const newfcj = FCJson.parse(JSON.parse(reader.result as string));

				if (newfcj) {
          onorigin(newfcj.origin);
          onfcj(newfcj);
				}
			}
		};
		reader.readAsText(file);
	};
</script>

<div class="row">
	<label for="box-file-input" class="col col-form-label">Select Box File:</label>
	<div class="col" style:overflow="hidden" id="box-file-input">
		<label
			for="boxfile"
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
			id="boxfile"
			class="form-control"
			type="file"
			accept=".json, .f3a, '.F3A"
			bind:files
			style="display:none"
			onchange={() => {
				if (files && files.length) {
					loadBoxFile(files[0]);
				}
			}}
		/>
	</div>
</div>
