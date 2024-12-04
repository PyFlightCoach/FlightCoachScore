<script lang="ts">
  import {base} from "$app/paths";
  import {dbServer} from "$lib/api";
  import NavMenu from "$lib/components/NavMenu.svelte";
	import { user } from '$lib/stores/user';
	import { dev } from '$app/environment';

const uploadFlight = (file: File) => {
  const form_data = new FormData();
  form_data.append('files', file);
  const r = dbServer.post('flight', form_data);
};

</script>

<NavMenu tooltip="Database Menu">
  <span slot="icon"><i class="bi bi-database"></i> </span>
  {#if $user?.is_superuser || dev}
  <label class="dropdown-item">
    <input
      type="file"
      name="input-name"
      style="display: none;"
      accept=".ajson"
      on:change={(e: Event) => {
        if (e.target?.files?.length > 0) {uploadFlight(e.target.files[0])};
      }}
    />
    <span>Upload</span>
  </label>
  {/if}
  <a class="dropdown-item" href="{base}/database/query/leaderboards">Leaderboards</a>
</NavMenu>
