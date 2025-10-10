<script lang="ts">
	import { resolve } from '$app/paths';
	import NavMenu from './NavMenu.svelte';
	import { user } from '$lib/stores/user';

</script>

<NavMenu tooltip="Database Menu">
	<span slot="icon"><i class="bi bi-database"></i> </span>
	{#if $user?.is_verified}
		<a class="dropdown-item" href="{resolve('/database/leaderboards')}">Leaderboard</a>
	{/if}
	<a class="dropdown-item" href="{resolve('/schedules')}">Schedules</a>
 
</NavMenu>
