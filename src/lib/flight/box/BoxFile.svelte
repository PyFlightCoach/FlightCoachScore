<script lang="ts">
	import { FCJson, Origin } from '$lib/flight/fcjson';

	let {
		onorigin = () => {},
		file = $bindable()
	}: {
		onorigin?: (origin: Origin) => void;
		file?: File | undefined;
	} = $props();


</script>

<div class="row">
	<label for="box-file-input" class="col col-form-label">Select Box File:</label>
	<div class="col" style:overflow="hidden" id="box-file-input">
		<label
			for="boxfile"
			class="btn btn-outline-secondary form-control text-nowrap"
			style:overflow="hidden"
		>
			{#if file}
				{file.name}
			{:else}
				Select File
			{/if}
		</label>
		<input
			id="boxfile"
			class="form-control"
			type="file"
			accept=".json, .f3a, '.F3A"
			style="display:none"
			onchange={(e) => {
				const files = (e.target as HTMLInputElement).files;
				if (files && files.length) {
					
					const reader = new FileReader();
					reader.onload = (e) => {
            try {
              const newOrigin = Origin.parseString(reader.result as string);
              file = files[0];
              onorigin(newOrigin);
            } catch (err) {
              alert('Error parsing Box file: ' + err);
            }

					};
					reader.readAsText(files[0]);
				}
			}}
		/>
	</div>
</div>
