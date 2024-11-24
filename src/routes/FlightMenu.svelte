<script lang="ts">
	import NavMenu from '$lib/components/NavMenu.svelte';
	import { base } from '$app/paths';
	import { manNames, bin } from '$lib/stores/analysis';
	import { clearAnalysis, exportAnalysis, loadExample, importAnalysis } from '$lib/analysis/analysis';
	import { goto } from '$app/navigation';
	import { saveAs } from 'file-saver';
	
  let importedname: string | undefined
  
  const parseAnalysis = (file: File) => { 
    const reader = new FileReader();
    reader.onload = (e) => {
      importedname = file.name;
      importAnalysis(JSON.parse(reader.result));
      goto(base + '/flight/results');
    };
    reader.readAsText(file);
  }


</script>

<NavMenu>
	<span slot="icon"><i class="bi bi-airplane"></i></span>
	{#if $bin}
		<h5 class="dropdown-header">{$bin.name}</h5>
	{:else if $manNames}
		<h5 class="dropdown-header">{importedname || 'Example Loaded'}</h5>
	{/if}
	{#if $manNames}
		<button
			class="dropdown-item"
			on:click={() => {
				clearAnalysis();
				goto(`${base}/`);
			}}>Clear</button
		>
		<button
			class="dropdown-item"
			on:click={() => {
				exportAnalysis(false).then((res) => {
					saveAs(res, 'flight.ajson');
				});
			}}
		>
			Export Full
		</button>
		<button
			class="dropdown-item"
			on:click={() => {
				exportAnalysis(true).then((res) => {
					saveAs(res, 'flight.ajson');
				});
			}}
		>
			Export Short
		</button>
		<a class="dropdown-item" href={base + '/flight/results'}>Results</a>
	{:else}
		<a class="dropdown-item" href={base + '/flight/create/data'}>Create</a>
		<label class="dropdown-item">
			<input
				type="file"
				name="input-name"
				style="display: none;"
        accept=".json, .ajson"
				on:change={(e) => {
					if (e.target?.files?.length > 0) {parseAnalysis(e.target.files[0])};
				}}
			/>
			<span>Import</span>
		</label>

		<button
			class="dropdown-item"
			on:click={() => {
				loadExample().then(() => {
					goto(base + '/flight/results');
				});
			}}
		>
			Example
		</button>
	{/if}
</NavMenu>
