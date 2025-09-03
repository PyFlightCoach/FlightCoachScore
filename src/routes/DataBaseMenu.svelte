<script lang="ts">
	import { base } from '$app/paths';
	import NavMenu from './NavMenu.svelte';
	import { user } from '$lib/stores/user';
	import { ContestManager } from '$lib/competitions/compthings/ContestManager';
	import { setComp, cdComps} from '$lib/stores/contests';
	import { goto } from '$app/navigation';

</script>

<NavMenu tooltip="Database Menu">
	<span slot="icon"><i class="bi bi-database"></i> </span>
	{#if $user?.is_verified}
		<a class="dropdown-item" href="{base}/database/query/leaderboards">Leaderboard</a>
	{/if}
	<a class="dropdown-item" href="{base}/schedule">Schedules</a>
  {#if $user?.is_verified}
		
		<a class="dropdown-item" href="{base}/competition/browse">Competitions</a>
	{/if}
</NavMenu>
