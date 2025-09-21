<script lang="ts">
	import { resolve } from '$app/paths';
	import NavMenu from './NavMenu.svelte';
	import { activeComp } from '$lib/stores/contests';
	import { listComps } from '$lib/competitions/contests/contests';
	import Popup from '$lib/components/Popup.svelte';
	import CompetitionEditor from '$lib/competitions/compthings/CompetitionEditor.svelte';
	import { user } from '$lib/stores/user';

	let showPopup = $state(false);

	let myComps = $derived(listComps('Mine', undefined));
	let enteredComps = $derived(listComps('Entered', undefined));
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

		{#await myComps}
			<div class="dropdown-item">...Loading</div>
		{:then comps}
			{#if comps.length}
				<div class="dropdown-divider"></div>
				<div class="dropdown-header">My Competitions</div>
				{#each comps as comp}
					<a
						class="dropdown-item"
						href={resolve('/competition/load') + `/?id=${comp.summary.id}`}
						data-sveltekit-preload-data="tap">{comp.summary.name}</a
					>
				{/each}
			{/if}
		{/await}
	{/if}
	{#await enteredComps}
		<div class="dropdown-item">...Loading</div>
	{:then comps}
		{#if comps.length}
			<div class="dropdown-divider"></div>
			<div class="dropdown-header">Entered Competitions</div>

			{#each comps as comp}
				<a
					class="dropdown-item"
					href={resolve('/competition/load') + `/?id=${comp.summary.id}`}
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
