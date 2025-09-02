<script lang="ts">
	import NavMenu from './NavMenu.svelte';
	import { base } from '$app/paths';
	import { manNames, bin } from '$lib/stores/analysis';
	import {
		exportAnalysis,
		loadExample,
		importAnalysis,
		clearDataLoading
	} from '$lib/flight/analysis';
	import { goto } from '$app/navigation';
	import { saveAs } from 'file-saver';
	import { loading } from '$lib/stores/shared';
	import { user } from '$lib/stores/user';
	import { dev } from '$lib/stores/shared';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	let importedname: string | undefined;

	const parseAnalysis = (file: File) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			importedname = file.name;
			importAnalysis(JSON.parse(reader.result as string));
			goto(resolve('/flight/results'));
		};
		reader.readAsText(file);
	};
</script>

<NavMenu tooltip="Flight Analysis Menu">
	<span slot="icon"><i class="bi {$manNames ? 'bi-airplane-fill' : 'bi-airplane'}"></i></span>
	{#if $bin}
		<h5 class="dropdown-header">{$bin.name}</h5>
	{:else if $manNames}
		<h5 class="dropdown-header">{importedname || 'Example Loaded'}</h5>
	{/if}
	{#if $manNames}
		<button
			class="dropdown-item"
			on:click={() => {
				clearDataLoading();
				if (page.url.pathname.includes('/flight/')) {
					goto(resolve('/'));
				}
			}}>Clear</button
		>
		{#if $user?.is_superuser || $dev}
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
		{/if}
		<a class="dropdown-item" href={resolve('/flight/results')}>Results</a>
	{:else}
		<a class="dropdown-item" href={resolve('/flight/create/data')}>Create</a>
		{#if $user?.is_superuser || $dev}
			<label class="dropdown-item">
				<input
					type="file"
					name="input-name"
					style="display: none;"
					accept=".json, .ajson"
					on:change={(e) => {
						if (e.target?.files?.length > 0) {
							parseAnalysis(e.target.files[0]);
						}
					}}
				/>
				<span>Import</span>
			</label>
		{/if}
		<button
			class="dropdown-item"
			data-sveltekit-preload-data="tap"
			on:click={() => {
				$loading = true;
				loadExample()
					.then(() => {
						goto(resolve('/flight/results'));
					})
					.finally(() => ($loading = false));
			}}
		>
			Example
		</button>
	{/if}
</NavMenu>
