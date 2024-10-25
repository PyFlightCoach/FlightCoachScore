<script lang="ts">
	import NavMenu from '$lib/components/NavMenu.svelte';
	import ServerSelection from '$lib/components/ServerSelection.svelte';

	import { analysisServerAddress, ukAnalysisServer, customAnalysisServer } from '$lib/api';
	import { dbServerAddress, ukDBServer, customDBServer } from '$lib/api';
</script>

<NavMenu>
	<span slot="icon"><i class="bi bi-gear" ></i> </span>

	<ServerSelection
		title="Analysis Server"
		uk={ukAnalysisServer}
		bind:custom={$customAnalysisServer}
		bind:active={$analysisServerAddress}
	/>
	<div class="dropdown-divider" />
	<ServerSelection
		title="Database Server"
		uk={ukDBServer}
		bind:custom={$customDBServer}
		bind:active={$dbServerAddress}
	/>

</NavMenu>
