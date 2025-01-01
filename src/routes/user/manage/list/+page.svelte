<script lang="ts">
    import { dbServer } from '$lib/api';
	import { invalidateAll } from '$app/navigation';

	let showID: string | undefined = undefined;

	export let data;

    async function patch(item) {
        const res = await dbServer.patch('users/'+showID, item);
        invalidateAll();
    }

    async function _delete(event: Event) {
    }
    
    

</script>

<div class="container" style="max-width: 1024px">
	<div class="table-responsive">
		<table class="table table-striped text-center">
			<thead class="table-dark" style="z-index:-1">
                <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Country</th>
                    <th>Status</th>

                </tr>
            </thead>
            <tbody>
                {#each data.users as u, i}
                    <tr role="button"
                    on:click={() => {
                        if (showID == u.id) {
                            showID = undefined;
                        } else {
                            showID = u.id;
                        }
                    }}>
                        <td>{u.id}</td>
                        <td>{u.email}</td>
                        <td>{u.first_name} {u.last_name}</td>
                        <td>{u.country}</td>
                        <td>
                            {#if u.is_active}A{:else}-{/if}
                            {#if u.is_verified}V{:else}-{/if}
                            {#if u.is_superuser}S{:else}-{/if}
                            {#if u.is_cd}C{:else}-{/if}
                        </td>
                        <td>
                            {#if showID == u.id}
                                <i class="bi bi-chevron-up"></i>
                            {:else}
                                <i class="bi bi-chevron-down"></i>
                            {/if}
                        </td>
                    </tr>
					{#if showID == u.id}
						<tr>
							<td>
                                {#if u.is_active}
                                    <button type="button" class="btn btn-primary" on:click={() => {patch({is_active: false});}}>Deactivate</button>
                                    {#if u.is_cd}
                                        <button type="button" class="btn btn-primary" on:click={() => {patch({is_cd: false});}}>Remove CD</button>
                                    {:else}
                                        <button type="button" class="btn btn-primary" on:click={() => {patch({is_cd: true});}}>Make CD</button>
                                    {/if}
                                    {#if u.is_superuser}
                                        <button type="button" class="btn btn-primary" on:click={() => {patch({is_superuser: false});}}>Remove S-User</button>
                                    {:else}
                                        <button type="button" class="btn btn-primary" on:click={() => {patch({is_superuser: true});}}>Make S-User</button>
                                    {/if}

                                {:else}
                                    <button type="button" class="btn btn-primary" on:click={() => {patch({is_active: true});}}>Activate</button>
                                    <button type="button" class="btn btn-primary" on:click={_delete}>Delete</button>
                                {/if}
                                
                            </td>
						</tr>
					{/if}
                {/each}
            </tbody>
        </table>
    </div>
</div>