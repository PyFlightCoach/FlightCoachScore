<script lang="ts">
	import { FCJson, Origin } from '$lib/analysis/fcjson';
	import PilotCentre from './PilotCentre.svelte';
	import BoxFile from './BoxFile.svelte';
	import pkg from 'file-saver';
	import BinFileBox from './BinFileBox.svelte';
	import PilotHeading from './PilotHeading.svelte';
	import FCSites from './FCSites.svelte';
	import { GPS } from '$lib/analysis/geometry';
	const { saveAs } = pkg;

	export let origin: Origin | undefined;
	export let fcjson: FCJson | undefined;
	export let target: GPS | undefined;

	$: if (target) {
		if (origin && GPS.sub(target, origin.pilot).length() > 500) {
			//origin = undefined;
		}
	}

	let inputMode = origin ? 'ph' : 'fcsites';

	const inputNames: Record<string, string> = {
		fcsites: 'Flight Coach Sites',
		pc: 'Pilot, Centre',
		ph: 'Pilot, Heading',
		fcj: 'F3A Zone / FC JSON File',
		bin: 'BIN File'
	};
</script>

<div class="row mt-2 mb-3">
	<label class="col" for="box-input-mode">Select Box Input Mode: </label>
	<select class="col form-select" id="data-input-mode" bind:value={inputMode}>
		{#each Object.entries(inputNames) as [k, v]}
			<option value={k}>{v}</option>
		{/each}
	</select>
</div>
{#if inputMode === 'fcsites'}
	<FCSites bind:origin bind:target />
{:else if inputMode === 'fcj'}
	<BoxFile bind:origin bind:fcjson />
{:else if inputMode === 'bin'}
	<BinFileBox bind:origin />
{:else if inputMode === 'pc'}
	<PilotCentre bind:origin />
{:else if inputMode === 'ph'}
	<PilotHeading bind:origin />
{/if}
