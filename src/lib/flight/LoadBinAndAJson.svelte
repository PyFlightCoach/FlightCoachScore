<script lang="ts">
	import FileInput from '$lib/components/FileInput.svelte';
	import { loading, dataSource, activeFlight } from '$lib/stores/shared';
	import { bin } from '$lib/stores/analysis';
	import { importAnalysis, checkDuplicate, loadAnalysisFromDB } from '$lib/flight/analysis';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { cat } from '$lib/utils/files';

	let { onload = () => {} }: { onload: () => void } = $props();

	let binfile: File | undefined = $state();
	let ajsonfile: File | undefined = $state();
	let form_state: string | undefined = $state();

	$inspect('binFile', binfile, 'ajsonfile', ajsonfile);
</script>

{#if form_state}
	<div class="row mt-4">
		<p><mark>{form_state}</mark></p>
	</div>
{/if}
<FileInput name="ajson file:" accept=".ajson, .json" bind:file={ajsonfile} />
<FileInput
	name="bin file:"
	accept=".bin, .BIN"
	bind:file={binfile}
	onchange={(file: File | undefined) => {
		form_state = undefined;
		if (file) {
			checkDuplicate(file).then((id: string) => {
				if (id) {
					form_state = 'BIN file already exists on server';
					if (confirm(form_state + ', do you want to load it?')) {
						loadAnalysisFromDB(id);
						onload();
					}
					binfile = undefined;
					$bin = undefined;
				}
			});
		}
	}}
/>
<button
	class="btn btn-primary w-100"
	disabled={!ajsonfile}
	onclick={() => {
		$loading = true;
		cat(ajsonfile!, 'readAsText')
			.then((text) => JSON.parse(text as string))
			.then((data) => {
				$activeFlight = undefined;
        return importAnalysis(data);
			})
      .then(()=>{
        $dataSource = binfile ? 'bin' : 'ajson';
				$bin = binfile;
        onload();
				goto(resolve('/flight/results'));
      })
			.finally(() => {
				loading.set(false);
			});
	}}>Load</button
>
