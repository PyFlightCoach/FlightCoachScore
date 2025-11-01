<script lang="ts">
	import NavMenu from './NavMenu.svelte';
	import { manNames, bin, bootTime, states } from '$lib/stores/analysis';
	import { exportAnalysis, loadExample, clearDataLoading } from '$lib/flight/analysis';
	import { goto } from '$app/navigation';
	import { saveAs } from 'file-saver';
	import { loading } from '$lib/stores/shared';
	import { user } from '$lib/stores/user';
	import { dev, dataSource } from '$lib/stores/shared';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Popup from '$lib/components/Popup.svelte';
	import LoadBinAndAJson from '$lib/flight/LoadBinAndAJson.svelte';

	let showBinAJsonPopup: boolean = $state(false);
</script>

<NavMenu tooltip="Flight Analysis Menu">
	<span slot="icon"><i class="bi {$manNames ? 'bi-airplane-fill' : 'bi-airplane'}"></i></span>
	{#if $states || $manNames?.length}
		<small class="px-2 text-start">{$bin?.name || `Loaded ${$dataSource}`}</small>
		{#if $bootTime}
			<small class="dropdown-header text-nowrap px-2 text-start">
				{$bootTime.toLocaleString()}
			</small>
		{/if}
	{/if}
	{#if $manNames}
		<button
			class="dropdown-item"
			onclick={() => {
				clearDataLoading();
				if (page.url.pathname.includes('/flight/')) {
					goto(resolve('/'));
				}
			}}>Clear</button
		>
		{#if $user?.is_superuser || $dev}
			<button
				class="dropdown-item"
				onclick={() => {
					saveAs(exportAnalysis(false), 'flight.ajson');
				}}
			>
				Export Full
			</button>
			<button
				class="dropdown-item"
				onclick={() => {
					saveAs(exportAnalysis(true), 'flight.ajson');
				}}
			>
				Export Short
			</button>
		{/if}
		<a class="dropdown-item" href={resolve('/flight/results')}>Results</a>
	{:else}
    <a class="dropdown-item" href={resolve('/flight/create/bin')}>Create</a>
		{#if $user?.is_superuser || $dev}
			<button
				class="dropdown-item"
				onclick={() => {
					showBinAJsonPopup = true;
				}}
			>
				Import
			</button>
		{/if}
		<button
			class="dropdown-item"
			data-sveltekit-preload-data="tap"
			onclick={() => {
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
<Popup bind:show={showBinAJsonPopup}>
	<LoadBinAndAJson
		onload={() => {
			showBinAJsonPopup = false;
		}}
	/>
</Popup>
