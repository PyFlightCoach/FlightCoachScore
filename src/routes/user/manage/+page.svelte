<script lang="ts">
    import { dbServer } from '$lib/api/api.js';
	import { invalidateAll } from '$app/navigation';
	
	let showID: string | undefined = undefined;
    let pageMode: string = "list";
	let formState: string | undefined;
    let areYouSure: boolean = false;

	export let data;

    async function _patch(item: any) {
        if (confirm(`Are you sure you want to ${Object.keys(item)[0]} ${Object.values(item)[0]} user ${showID}?`)) {
          const res = await dbServer.patch('users/'+showID, item);
        if (res.status != 200) {
            formState = 'Something went wrong!';
            return;
        }
        formState = undefined;
        invalidateAll();
        };
        
    }

    async function _delete(event: Event) {
      if (confirm(`Are you sure you want to delete user ${showID}?`)) {
        const res = await dbServer.delete('users/'+showID);
        if (res.status != 204) {
            formState = 'Something went wrong!';
            return;
        }
        formState = undefined;
        invalidateAll();
      }
    }
    
    async function _handleSubmitEmail(event: Event) {
      if (confirm(`Are you sure you want to email user ${showID}?`)) {
        const fdata = new FormData(event.currentTarget as HTMLFormElement);

        const res = await dbServer.patch('users/send_email/'+showID, fdata);
        if (res.status != 200) {
            formState = 'Something went wrong!';
            return;
        }
        formState = 'Email Sent'
        pageMode = 'list';
        invalidateAll();
      }
    }

</script>

<div class="container" style="max-width: 1024px">
{#if formState}
    <div class="row mt-4">
        <p><mark>{formState}</mark></p>
    </div>
{/if}

{#if pageMode == "list"}
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
                            formState = undefined;
                            areYouSure = false;
                        } else {
                            if (u.email != "admin@fcscore.org") showID = u.id;
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
							<td colspan="6">
                {#if u.is_active}
                  <button type="button" class="btn btn-primary" on:click={() => {_patch({is_active: false});}}>Deactivate</button>
                  {#if u.is_cd}
                      <button type="button" class="btn btn-primary" on:click={() => {_patch({is_cd: false});}}>Remove CD</button>
                  {:else}
                      <button type="button" class="btn btn-primary" on:click={() => {_patch({is_cd: true});}}>Make CD</button>
                  {/if}
                  {#if u.is_superuser}
                      <button type="button" class="btn btn-primary" on:click={() => {_patch({is_superuser: false});}}>Remove S-User</button>
                  {:else}
                      <button type="button" class="btn btn-primary" on:click={() => {_patch({is_superuser: true});}}>Make S-User</button>
                  {/if}

                {:else}
                  <button type="button" class="btn btn-primary" on:click={() => {_patch({is_active: true});}}>Activate</button>
                  {#if !areYouSure}
                      <button type="button" class="btn btn-primary" on:click={() => {areYouSure=true;}}>Delete</button>
                  {:else}
                      <button type="button" class="btn btn-primary" on:click={() => {areYouSure=false;}}>No Don't Delete</button>
                      <button type="button" class="btn btn-primary" on:click={_delete}>Yes DELETE!</button>
                  {/if}
                {/if}
                <button type="button" class="btn btn-primary" on:click={() => {pageMode = "email"; invalidateAll();}}>Email</button>
              </td>
						</tr>
					{/if}
                {/each}
            </tbody>
        </table>
    </div>
{/if}

{#if pageMode == "email"}
    <form class="row mt-4" method="POST" on:submit|preventDefault={_handleSubmitEmail}>
        <div class="mb-3">
            <label for="subject" class="form-label">Email Subject</label>
            <textarea class="form-control" id="subject" name="subject" rows="1" required></textarea>
        </div>

        <div class="mb-3">
            <label for="body" class="body">Email Body</label>
            <textarea class="form-control" id="body" name="body" rows="6"></textarea>
        </div>

        <div class="mb-3">
			<div class="custom-check checkbox-lg">
				<input class="custom-check-input" type="checkbox" id="body_is_html" name="body_is_html" checked/>
				<label class="custom-check-label" for="body_is_html">
					Body is html (not plain text)
				</label>
			</div>
		</div>

        <div class="mb-3">
			<div class="custom-check checkbox-lg">
				<input class="custom-check-input" type="checkbox" id="cc_admin" name="cc_admin" checked/>
				<label class="custom-check-label" for="cc_admin">
					Cc: admin@fcscore.org
				</label>
			</div>
		</div>

        <div class="mb-3">
			<div class="custom-check checkbox-lg">
				<input class="custom-check-input" type="checkbox" id="send_to_all_active_users" name="send_to_all_active_users"/>
				<label class="custom-check-label" for="send_to_all_active_users">
					Actually, send this to all active users (CAREFUL!)
				</label>
			</div>
		</div>

        <div class="mb-3">
			<button type="submit" class="btn btn-primary me-3">Send Email</button>
		</div>
    </form>
    <button type="button" class="btn btn-primary" on:click={() => {pageMode = "list"; invalidateAll();}}>Back</button>
{/if}
</div>
