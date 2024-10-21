<script lang="ts">
  import NavMenu from '$lib/components/NavMenu.svelte';
	import { FCJson, Origin } from '$lib/analysis/fcjson';
	import { GPS } from '$lib/analysis/geometry';
		
	export let origin: Origin;
	export let kind: string = 'F3A';
	let file: File;

	const loadBoxFile = (event) => {
		file = event.target.files[0];
		const reader = new FileReader();
		reader.onload = (e) => {
			const contents = reader.result as string;

			if (contents.startsWith('Emailed box data for F3A Zone Pro')) {
				const data = contents.split('\n');

				origin = Object.assign(
					origin,
					Origin.from_centre(
						new GPS(parseFloat(data[2]), parseFloat(data[3]), parseFloat(data[6])),
						new GPS(parseFloat(data[4]), parseFloat(data[5]), parseFloat(data[6]))
					)
				);
			} else {
				origin = Object.assign(origin, FCJson.parse(JSON.parse(contents)).origin);
			}
		};
		reader.readAsText(file);
	};

	const saveBox = () => {
		console.log(origin);
	};
</script>
<NavMenu>
  <span slot="icon">Box</span>
	{#if origin}
    <li class="dropdown-item">
      <input type="file" accept=".F3A, .f3a, .json" on:change={loadBoxFile} />
    </li>
		<li class="dropdown-item">
      <input bind:value={origin.lat} step="0.0001" type="number" data-bs-toggle="tooltip" data-bs-title="Pilot Latiude" />
    </li>
			
		<li class="dropdown-item">
      <input bind:value={origin.lng} step="0.0001" type="number" data-bs-toggle="tooltip" data-bs-title="Pilot Longitude" />
		</li>
		<li class="dropdown-item">
      <input bind:value={origin.alt} step="1.0" type="number" data-bs-toggle="tooltip" data-bs-title="Pilot Altitude" />
		</li>
		<li class="dropdown-item">
      <input bind:value={origin.heading} step="1.0" type="number" data-bs-toggle="tooltip" data-bs-title="Pilot Heading" />
		</li>
		<li class="dropdown-item">
      <button on:click={saveBox} >Export F3A Zone</button>
    </li>
    <li><hr class="dropdown-divider"></li>
		<li class="dropdown-item">
			{#each ['F3A', 'IAC'] as _kind}
        <input id="{kind}radio" class="form-check-input" type="radio" bind:group={kind} value={_kind}>
        <label class="form-check-label" for="{kind}radio">
          {_kind}
        </label>
			{/each}
    </li>
	{/if}
</NavMenu>
