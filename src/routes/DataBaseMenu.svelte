<script lang="ts">
  import {base} from "$app/paths";
  import NavMenu from "$lib/components/NavMenu.svelte";
	import { user } from '$lib/stores/user';


</script>

<NavMenu tooltip="Database Menu">
  <span slot="icon"><i class="bi bi-database"></i> </span>
  {#if $user?.is_verified}
    <a class="dropdown-item" href="{base}/database/query/leaderboards">Leaderboard</a>
  {/if}
  <a class="dropdown-item" href="{base}/schedule/browse">Schedules</a>
</NavMenu>
