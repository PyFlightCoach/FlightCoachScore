<script lang="ts">
  import {base} from "$app/paths";
  import {dbServer} from "$lib/api";
  import NavMenu from "$lib/components/NavMenu.svelte";
	import { user } from '$lib/stores/user';

const uploadFlight = (file: File) => {
  const form_data = new FormData();
  form_data.append('files', file);
  const r = dbServer.post('flight', form_data);
};


</script>

<NavMenu tooltip="Database Menu">
  <span slot="icon"><i class="bi bi-database"></i> </span>
  {#if $user?.is_verified}
    <a class="dropdown-item" href="{base}/database/query/leaderboards">Leaderboard</a>
  {/if}
  <a class="dropdown-item" href="{base}/schedule/browse">Schedules</a>
</NavMenu>
