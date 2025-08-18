<script lang="ts">
  import UserSearch from "$lib/components/UserSearch.svelte";
	import type { DBUser } from "$lib/stores/user";
  import {dbServer} from "$lib/api";

  let {users, compID}: {users: DBUser[], compID: string} = $props();

  let selectedUser : string | undefined = $state();

</script>

<div class="row p-2">
  <div class="col-10">
    <UserSearch {users} bind:selectedUser={selectedUser}  />
  </div>
  <button 
    class="col-2 btn btn-outline-primary" 
    disabled={selectedUser==""}
    onclick={()=>{
      dbServer.post(`competition/add_competitor/${compID}/${selectedUser}`)
    }}
  >Add Pilot</button>
</div>