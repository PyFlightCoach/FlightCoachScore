<script lang="ts">
  import {base} from "$app/paths";
  import NavMenu from "./NavMenu.svelte";
	import { user } from '$lib/stores/user';
  import {cdComps} from '$lib/stores/contests';

</script>

<NavMenu tooltip="Database Menu">
  <span slot="icon"><i class="bi bi-database"></i> </span>
  {#if $user?.is_verified}
    <a class="dropdown-item" href="{base}/database/query/leaderboards">Leaderboard</a>
  {/if}
  <a class="dropdown-item" href="{base}/schedule">Schedules</a>
  {#if $user?.is_superuser || $user?.is_cd}
    <div class="dropdown-divider"></div>
    <div class="dropdown-header">Contest Director</div>
    {#each Object.entries($cdComps) as [name, id]}
      <a class="dropdown-item" href="{base}/competition/management/?id={id}" data-sveltekit-preload-data="tap">{name}</a>
    {/each}
    <a class="dropdown-item" href="{base}/competition/management"  data-sveltekit-preload-data="tap">Create Competition</a>
    
  {/if}
  <div class="dropdown-divider"></div>
  <div class="dropdown-header">Competitions</div>


</NavMenu>
