<script lang="ts">
	import { resolve } from '$app/paths';
	import NavMenu from './NavMenu.svelte';

	import { myComps, enteredComps, reloadDropDownComps } from '$lib/stores/contests';
	import Popup from '$lib/components/Popup.svelte';
	import CompetitionEditor from '$lib/competitions/compthings/CompetitionEditor.svelte';
	import { user } from '$lib/stores/user';

	let {}: {} = $props();
	let showPopup = $state(false);

	const compListsReady = $derived(reloadDropDownComps());

	//loadComps();
</script>

<NavMenu tooltip="Competition Menu">
	<span slot="icon"><i class="bi bi-trophy"></i> </span>
	<a class="dropdown-item" href={resolve('/competition/browse')}>Browse Competitions</a>
	{#if $user?.is_cd || $user?.is_superuser}
		<button
			class="dropdown-item"
			onclick={() => {
				showPopup = true;
			}}
			data-sveltekit-preload-data="tap">Create Competition</button
		>
	{/if}
	{#await compListsReady}
		<div class="dropdown-item">...Loading</div>
	{:then}
		{#if $myComps?.length}
			<div class="dropdown-divider"></div>
			<div class="dropdown-header">My Competitions</div>
			{#each $myComps as comp}
				<a
					class="dropdown-item"
					href="{resolve('/competition/view/')}?id={comp.summary.id}"
					data-sveltekit-preload-data="tap">{comp.summary.name}</a
				>
			{/each}
		{/if}

		{#if $enteredComps?.length}
			<div class="dropdown-divider"></div>
			<div class="dropdown-header">Entered Competitions</div>

			{#each $enteredComps as comp}
				<a
					class="dropdown-item"
					href="{resolve('/competition/view/')}?id={comp.summary.id}"
					data-sveltekit-preload-data="tap">{comp.summary.name}</a
				>
			{/each}
		{/if}
	{/await}
</NavMenu>
<Popup bind:show={showPopup}>
	<CompetitionEditor
		oncreated={() => {
			showPopup = false;
		}}
	/>
</Popup>
