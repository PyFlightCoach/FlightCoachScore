<script lang="ts">
	import { FCJson, Origin } from '$lib/flight/fcjson';
	import PilotCentre from './PilotCentre.svelte';
	import BoxFile from './BoxFile.svelte';
	import PilotHeading from './PilotHeading.svelte';
	import FCSites from './FCSites.svelte';
	import { GPS } from '$lib/utils/geometry';

	const inputNames: Record<string, string> = {
		fcsites: 'Flight Coach Sites',
		pc: 'Pilot, Centre',
		ph: 'Pilot, Heading',
		fcj: 'F3A Zone / FC JSON File'
	};


	let {
    target,
		origin,
		onorigin = () => {},
		onfcj = () => {},
    siteInputMode = $bindable('fcsites')
	}: {
    target: GPS;
		origin: Origin;
		onorigin: (neworigin: Origin) => void;
		onfcj: (newfcj: FCJson) => void;
    siteInputMode: keyof typeof inputNames;
	} = $props();


  //let inputMode: keyof typeof inputNames = $state('ph');
  //
  //$effect(()=>{
  //  inputMode = GPS.sub(target, origin.pilot).length() < 200 ? 'ph' : 'fcsites';
  //});

</script>

<div class="row p-2">
	<label class="col" for="col-form-label box-input-mode">Input Mode:</label>
	<select class="col col-from-control form-select" id="data-input-mode" bind:value={siteInputMode}>
		{#each Object.entries(inputNames) as [k, v]}
			<option value={k}>{v}</option>
		{/each}
	</select>
</div>
<div class="row p-2">
	{#if siteInputMode === 'fcsites'}
		<FCSites target={target} onchange={onorigin} />
	{:else if siteInputMode === 'fcj'}
		<BoxFile {onorigin} {onfcj}/>
	{:else if siteInputMode === 'pc'}
		<PilotCentre {origin} onchange={onorigin}/>
	{:else if siteInputMode === 'ph'}
		<PilotHeading {origin} onchange={onorigin}/>
	{/if}
</div>
