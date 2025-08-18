<script lang="ts">
  import {base} from "$app/paths";
  import NavMenu from "./NavMenu.svelte";
	import { user } from '$lib/stores/user';


</script>

<NavMenu tooltip="Database Menu">
  <span slot="icon"><i class="bi bi-database"></i> </span>
  {#if $user?.is_verified}
    <a class="dropdown-item" href="{base}/database/query/leaderboards">Leaderboard</a>
  {/if}
  <a class="dropdown-item" href="{base}/schedule">Schedules</a>
  {#if $user?.is_superuser || $user?.is_cd}
    <div class="dropdown-divider"></div>
    <div class="dropdown-header">Competitions</div>
    <a class="dropdown-item" href="{base}/competition/create">Create</a>
  {/if}
</NavMenu>
