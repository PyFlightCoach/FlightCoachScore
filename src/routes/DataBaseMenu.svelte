<script lang="ts">
  import {base} from "$app/paths";
  import NavMenu from "$lib/components/NavMenu.svelte";
</script>


<NavMenu>
  <span slot="icon"><i class="bi bi-database"></i> </span>
  <div class="dropdown-item" >Upload</div>
  <a class="dropdown-item" href="{base}/database/leaderboards">Leaderboards</a>
</NavMenu>