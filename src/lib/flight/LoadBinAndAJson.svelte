<script lang="ts">
	import FileInput from '$lib/components/FileInput.svelte';
	import { loading, activeFlight } from '$lib/stores/shared';
	import {
		importAnalysis,
		checkDuplicate,
		clearDataLoading,
		clearAnalysis
	} from '$lib/flight/analysis';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { cat } from '$lib/utils/files';
	import { FlightDataSource } from './flight';
	import { md5 } from 'js-md5';
	import { Splitting } from './splitting';
	import type { AJson } from './ajson';
	import { Origin } from './fcjson';
	
	let { onload = () => {} }: { onload: () => void } = $props();

	let binfile: File | undefined = $state();
	let ajsonfile: File | undefined = $state();
	let form_state: string | undefined = $state();
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
			cat(file, 'readAsArrayBuffer').then((b) => checkDuplicate(md5(b as ArrayBuffer), onload));
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
			.then(async (data: AJson) => {
				clearAnalysis();
				clearDataLoading();
        const splitting = await Splitting.parseAJson(data);
				$activeFlight = new FlightDataSource(
					binfile,
					binfile ? 'bin' : 'ajson',
					undefined,
					new Date(Date.parse(data.bootTime!)),
					data,
					Origin.parse(data.origin),
          splitting,
          splitting.schedule,
          undefined,
          data.mans.map(m=>m.history || {})
				);
				onload();
				goto(resolve('/flight/results'));
			})
			.finally(() => {
				loading.set(false);
			});
	}}>Load</button
>
