<script lang="ts">
  import NavMenu from "$lib/components/NavMenu.svelte";
</script>

<NavMenu>
  <span slot="icon"><i class="bi bi-airplane"/></span>
  <a class="dropdown-item" href='/analysis/upload/'>Load</a>
  <div class="dropdown-item" >Import</div>
  <div class="dropdown-item" >Example</div>
</NavMenu>