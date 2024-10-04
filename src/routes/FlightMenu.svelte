<script lang="ts">
  import NavMenu from "$lib/components/NavMenu.svelte";
  import {base} from "$app/paths";
</script>

<NavMenu>
  <span slot="icon"><i class="bi bi-airplane"/></span>
  <a class="dropdown-item" href={base + '/analysis/upload/'}>Load</a>
  <div class="dropdown-item" >Import</div>
  <div class="dropdown-item" >Example</div>
</NavMenu>