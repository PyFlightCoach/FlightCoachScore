<script lang="ts">
  import {base} from "$app/paths";
  import NavMenu from "./NavMenu.svelte";
	import { user } from '$lib/stores/user';
  import {activeComp, cdComps, createEmptyComp} from '$lib/stores/contests';
	import { dbServer } from "$lib/api";
	import type { CompThingSummary } from "$lib/competitions/compInterfaces";
	import { goto } from "$app/navigation";
	import { faVersion } from "$lib/stores/shared";

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
    <button class="dropdown-item" onclick={()=>{
      const name = prompt("Enter new competition name:");
      if (name) {
        createEmptyComp(name)
          .then((newComp) => {
            goto(`/competition/management/?id=${newComp.id}`);
          })
          .catch((error) => {
            alert("Error creating competition: " + error);
          });
      }
    }}  data-sveltekit-preload-data="tap">Create Competition</button>
    
  {/if}
  {#if $user?.is_verified}
    <div class="dropdown-divider"></div>
    <div class="dropdown-header">Competitions</div>
  {/if}

</NavMenu>
