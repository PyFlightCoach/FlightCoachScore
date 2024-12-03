<script lang="ts">
	import NavMenu from '$lib/components/NavMenu.svelte';
	import ServerSelection from '$lib/components/ServerSelection.svelte';

	import { anSOptions, anSOption, customAnalysisServer } from '$lib/api';
	import { dbSOption, customDbServer } from '$lib/api';
</script>

<NavMenu tooltip="Super User Menu">
	<span slot="icon"><i class="bi bi-star" ></i> </span>

	<ServerSelection
		title="Analysis Server"
    options={Object.keys(anSOptions)}
		bind:custom={$customAnalysisServer}
		bind:selected={$anSOption}
	/>
	<div class="dropdown-divider" ></div>
	<ServerSelection
		title="Database Server"
		options={['uk']}
		bind:custom={$customDbServer}
		bind:selected={$dbSOption}
	/>

</NavMenu>
