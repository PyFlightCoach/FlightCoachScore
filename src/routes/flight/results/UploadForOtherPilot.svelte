<script lang="ts">
	
  import Popup from "$lib/components/Popup.svelte";
  import UserSearch from "$lib/components/UserSearch.svelte";
	import {type DBUser, getUser } from "$lib/stores/user";

  let {pilotID = $bindable(), onadded=()=>{}} : {pilotID: string | undefined; onadded?: (user: DBUser | undefined) => void} = $props();

  let showSearchPilot: boolean = $state(false);
  let selectedPilot: DBUser | undefined = $state();

  let displayName = $derived(selectedPilot ? `${selectedPilot.first_name} ${selectedPilot.last_name} ${selectedPilot.country_emoji}` : undefined);
</script>

<div class="container-auto border rounded p-2 mb-2 text-nowrap">
  <div class="row px-2">
  <label for="pilotselect" class="col col-form-label">SU Upload for other:</label>
  <button id="pilotselect" class="col btn btn-outline-secondary" onclick={()=>{showSearchPilot=true}}>{displayName || "Select Pilot"}</button> 
  <button class="col-auto btn btn-outline-secondary" onclick={()=>{selectedPilot=undefined; pilotID=undefined; onadded(undefined); }}>Clear</button> 
  </div>
</div>

<Popup bind:show={showSearchPilot} >
  <UserSearch allowFake={false} onadded={(user=>{
    if (user && user.id) {
      getUser(user.id).then((u)=>{selectedPilot=u});
      
    } else {
      selectedPilot=undefined;
    }
    pilotID = user.id;   
    showSearchPilot=false;
    onadded(selectedPilot);
  })}/>
</Popup>