<script lang="ts">
	import { FCJson, Origin } from '$lib/flight/fcjson';

	let {
		origin = $bindable(),
		fcjson = $bindable()
	}: { origin?: Origin | undefined; fcjson?: FCJson | undefined } = $props();

	let files: FileList;

	const loadBoxFile = (file: File) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const _norg = Origin.parseF3aZone(reader.result as string);
			if (_norg) {
				origin = Object.assign(origin || new Origin(0, 0, 0, 0), _norg);
			} else {
				fcjson = FCJson.parse(JSON.parse(reader.result as string));

				if (fcjson) {
					origin = Object.assign(origin || new Origin(0, 0, 0, 0), fcjson.origin);
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
