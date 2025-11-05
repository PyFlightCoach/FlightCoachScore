<script lang="ts">
	import NavMenu from './NavMenu.svelte';
	import { exportAnalysis, loadExample, clearDataLoading, clearAnalysis } from '$lib/flight/analysis';
	import { goto } from '$app/navigation';
	import { saveAs } from 'file-saver';
	import { loading } from '$lib/stores/shared';
	import { user } from '$lib/stores/user';
	import { dev, activeFlight } from '$lib/stores/shared';
	import { resolve } from '$app/paths';
	import Popup from '$lib/components/Popup.svelte';
	import LoadBinAndAJson from '$lib/flight/LoadBinAndAJson.svelte';
	import { prettyDate } from '$lib/utils/text';
	import { manNames } from '$lib/stores/analysis';
  

	let showBinAJsonPopup: boolean = $state(false);
</script>

<NavMenu tooltip="Flight Analysis Menu">
	<span slot="icon"><i class="bi {$activeFlight ? 'bi-airplane-fill' : 'bi-airplane'}"></i></span>
	{#if $activeFlight}
		<small class="px-2 text-start text-nowrap text-body-secondary">{$activeFlight?.sourceDescription || 'unknown'}</small>
    <small class="px-2 text-start text-nowrap text-body-secondary">{prettyDate($activeFlight?.bootTime)}</small>
		{#if $manNames}
    <a class="dropdown-item" href={resolve('/flight/results')}>Results</a>
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
    {:else}
      <a class="dropdown-item" href={resolve('/flight/create/box')}>Box</a>
      <a class="dropdown-item" href={resolve('/flight/create/manoeuvres')}>Manoeuvres</a>
    {/if}
    <button
			class="dropdown-item"
			onclick={() => {
				clearDataLoading();
			}}>Clear</button
		>
	{:else}
    <a class="dropdown-item" href={resolve('/flight/create/bin')}>Load Ardupilot BIN File</a>
		{#if $user?.is_superuser || $dev}
      <a class="dropdown-item" href={resolve('/flight/create/acrowrx')}>Load Acrowrx File</a>
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
