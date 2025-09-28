<script lang="ts">
  import {type DBUser} from '$lib/stores/user';
  import TextInput from '$lib/components/TextInput.svelte';
  let {users, selectedUser=$bindable()}: {users: DBUser[], selectedUser:string|undefined} = $props()

  let filterPattern: string=$state("");
  let searchResults: DBUser[] = $derived(users.filter(user=>`${user.first_name} ${user.last_name} ${user.email}`.includes(filterPattern)));

  
</script>


<TextInput name="Filter" bind:value={filterPattern} />
<select 
  	class="col form-select text-center"
		id="version"
		name="version"
		required
		bind:value={selectedUser}
>
  {#each searchResults as foundUser }
    <option value={foundUser.id}>{foundUser.first_name} {foundUser.last_name}</option>
  {/each}
</select>
