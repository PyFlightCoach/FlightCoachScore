<script lang="ts">
	import { FCJson, Origin } from '$lib/analysis/fcjson';
	import { Point } from '$lib/analysis/geometry';
	import ToggleButton from '$lib/components/ToggleButton.svelte';
	import PilotCentre from './PilotCentre.svelte';
	import BoxFile from './BoxFile.svelte';
	import pkg from 'file-saver';
	import BinFileBox from './BinFileBox.svelte';
	import PilotHeading from './PilotHeading.svelte';
	const { saveAs } = pkg;

	export let origin: Origin | undefined; // = new Origin(0, 0, 0, 0);
  export let fcjson: FCJson | undefined;
	export let kind: string = 'F3A';

	const exportF3aZone = () => {
		if (!origin) return;
		const centre = origin.pilot.offset(
			new Point(100 * Math.cos(origin.radHeading), 100 * Math.sin(origin.radHeading), 0)
		);

		const data = [
			"Emailed box data for F3A Zone Pro - please DON'T modify!",
			'1',
			origin.lat.toString(),
			origin.lng.toString(),
			centre.lat.toString(),
			centre.lon.toString(),
			origin.alt.toString()
		];

		const blob = new Blob([data.join('\n')], { type: 'text/plain;charset=utf-8' });
		saveAs(blob, 'f3a_zone.f3a');
	};

	let inputMode = 'fcj';

  const inputNames = {
    pc: 'Pilot, Centre',
    ph: 'Pilot, Heading',
    fcj: 'F3A Zone / FC JSON File',
    bin: 'BIN File'
  }

</script>

<div class="input-group mb-3">
	<button
		class="btn btn-outline-secondary dropdown-toggle form-control-sm"
		type="button"
		data-bs-toggle="dropdown"
		aria-expanded="false"
	>
		{inputNames[inputMode] || 'Select Input Mode'}
	</button>
	<ul class="dropdown-menu">
		<li><ToggleButton bind:group={inputMode} value="pc">{inputNames["pc"]}</ToggleButton></li>
		<li><ToggleButton bind:group={inputMode} value="ph">{inputNames["ph"]}</ToggleButton></li>
		<li><ToggleButton bind:group={inputMode} value="fcj">{inputNames["fcj"]}</ToggleButton></li>
		<li><ToggleButton bind:group={inputMode} value="bin">{inputNames["bin"]}</ToggleButton></li>
	</ul>
	{#if inputMode === 'fcj'}
		<BoxFile bind:origin bind:fcjson />
	{:else if inputMode === 'bin'}
		<BinFileBox bind:origin />
	{/if}
	{#if origin}
		<button class="btn btn-outline-secondary form-control-sm" on:click={exportF3aZone}>
			Save Box
		</button>
    
	{/if}
  <slot/>
</div>
{#if inputMode === 'pc'}
  <PilotCentre bind:origin />
  {:else if inputMode === 'ph'}
  <PilotHeading bind:origin />
{/if}
