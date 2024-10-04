<script lang="ts">
  import NavMenu from "$lib/components/NavMenu.svelte";
</script>

<NavMenu>
  <span slot="icon"><i class="bi bi-person"/></span>
  <div class="dropdown-item" >Login</div>
  <div class="dropdown-item" >Sign Up</div>
</NavMenu>