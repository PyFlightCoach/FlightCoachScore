<script lang="ts">
	import { FCJson, Origin } from '$lib/analysis/fcjson';
	import PilotCentre from './PilotCentre.svelte';
	import BoxFile from './BoxFile.svelte';
	import BinFileBox from './BinFileBox.svelte';
	import PilotHeading from './PilotHeading.svelte';
	import FCSites from './FCSites.svelte';
	import { GPS } from '$lib/analysis/geometry';
  import {siteInputMode} from '$lib/stores/shared';
  

	export let origin: Origin | undefined;
	export let fcjson: FCJson | undefined = undefined;
	export let target: GPS | undefined;

	$: if (target) {
		if (origin && GPS.sub(target, origin.pilot).length() > 500) {
			//origin = undefined;
		}
	}

	const inputNames: Record<string, string> = {
		fcsites: 'Flight Coach Sites',
		pc: 'Pilot, Centre',
		ph: 'Pilot, Heading',
		fcj: 'F3A Zone / FC JSON File',
		//bin: 'BIN File'
	};
</script>

<div class="row p-2">
	<label class="col" for="col-form-label box-input-mode">Input Mode:</label>
	<select class="col col-from-control form-select" id="data-input-mode" bind:value={$siteInputMode}>
		{#each Object.entries(inputNames) as [k, v]}
			<option value={k}>{v}</option>
		{/each}
	</select>
</div>
<div class="row p-2">
{#if $siteInputMode === 'fcsites'}
	<FCSites bind:origin bind:target />
{:else if $siteInputMode === 'fcj'}
	<BoxFile bind:origin bind:fcjson />
{:else if $siteInputMode === 'bin'}
	<BinFileBox bind:origin />
{:else if $siteInputMode === 'pc'}
	<PilotCentre bind:origin />
{:else if $siteInputMode === 'ph'}
	<PilotHeading bind:origin />
{/if}
</div>