<script lang="ts">
	import NavMenu from '$lib/components/NavMenu.svelte';
	import ServerSelection from '$lib/components/ServerSelection.svelte';

	import { analysisServerAddress, ukAnalysisServer, preAnalysisServer, customAnalysisServer } from '$lib/api';
	import { dbServerAddress, ukDBServer, preDBServer, customDBServer } from '$lib/api';
</script>

<NavMenu tooltip="Super User Menu">
	<span slot="icon"><i class="bi bi-star" ></i> </span>

	<ServerSelection
		title="Analysis Server"
		uk={ukAnalysisServer}
    pre={preAnalysisServer}
		bind:custom={$customAnalysisServer}
		bind:active={$analysisServerAddress}
	/>
	<div class="dropdown-divider" ></div>
	<ServerSelection
		title="Database Server"
		uk={ukDBServer}
    pre={preDBServer}
		bind:custom={$customDBServer}
		bind:active={$dbServerAddress}
	/>

</NavMenu>
