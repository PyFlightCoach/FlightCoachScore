<script lang="ts">
    import {invalidateAll} from '$app/navigation';
    import {dbServer} from '$lib/api';

    export let data;
    let form_state: string | undefined;
    let showID: string | undefined = undefined;
    let current: any | undefined = undefined;

    async function _handleSubmit(event: Event) {
        if (event) {
            try {
                form_state = undefined;
                if (current) {
                    const res = await dbServer.patch('news/' + current.id, new FormData(event.currentTarget as HTMLFormElement));
                    form_state = "News item " + res.data.id + " successfully patched.";
                } else {
                    const res = await dbServer.post('news', new FormData(event.currentTarget as HTMLFormElement));
                    form_state = "News item " + res.data.id + " successfully created.";
                }
                current = undefined;
                showID = undefined;
                event.target.reset();
                invalidateAll();
            } catch (error) {
                form_state = 'Oops...something has gone wrong.';
            }
        }
	}

</script>


<div class="container border rounded bg-light" style="max-width:1024px">
    {#if form_state}
        <div class="row mt-4">
            <p><mark>{form_state}</mark></p>
        </div>
    {/if}

	<form class="row mt-4" method="POST" on:submit|preventDefault={_handleSubmit}>
		<div class="col">
            {#if current}
                <div class="mb-3">
                    <label for="headline" class="form-label">Required Headline</label>
                    <textarea class="form-control" id="headline" name="headline" rows="2" required>{current.headline}</textarea>
                </div>

                <div class="mb-3">
                    <label for="body" class="body">Optional Body</label>
                    <textarea class="form-control" id="body" name="body" rows="6">{current.body}</textarea>
                </div>

                <div class="mb-3">
                    <label for="link" class="body">Option Link URL</label>
                    <input type="url" class="form-control" id="link" name="link" value={current.link}/>
                </div>
            {:else}
                <div class="mb-3">
                    <label for="headline" class="form-label">Required Headline</label>
                    <textarea class="form-control" id="headline" name="headline" rows="2" required></textarea>
                </div>

                <div class="mb-3">
                    <label for="body" class="body">Optional Body</label>
                    <textarea class="form-control" id="body" name="body" rows="6"></textarea>
                </div>

                <div class="mb-3">
                    <label for="link" class="body">Option Link URL</label>
                    <input type="url" class="form-control" id="link" name="link"/>
                </div>
            {/if}
            <div>
                <button type="submit" class="btn btn-primary">{#if current}Update{:else}Create{/if}</button>
                <button type="button" class="btn btn-secondary"
                    on:click={(event) => {
                        current = undefined;
                        form_state = undefined;
                        invalidateAll();
                    }}
                >Clear Form</button>
            </div>
        </div>
	</form>
</div>

<div class="container mt-3 border rounded bg-light" style="max-width:1024px">
    <div class="mt-3">
        {#if data.news}
            <table class="table">
                <thead> <tr>
                    <th>Updated</th>
                    <th width="99%">Headline</th>
                </tr> </thead>
                <tbody>
                    {#each data.news as n}
                        <tr
                            role="button"
                            on:click={() => {
                                if (showID == n.id) {
                                    showID = undefined;
                                } else {
                                    showID = n.id;
                                }
                            }}>
                            <td>{n.updated_when}</td>
                            <td style="white-space: nowrap; text-overflow:ellipsis; overflow: hidden; max-width:1px;">{n.headline}</td>
                            {#if showID == n.id}
                                <td>
                                    <button type="button" class="btn btn-primary"
                                    on:click={async () => {
                                        current = n
                                        showID = undefined;
                                        form_state = undefined;
                                        invalidateAll();
                                    }}>
                                    Edit</button>
                                </td>
                                <td>
                                    <button type="button" class="btn btn-primary"
                                    on:click={async () => {
                                        try {
                                            const res = await dbServer.delete('news/' + n.id);
                                            form_state = "News item " + n.id + " deleted.";
                                            showID = undefined;
                                            invalidateAll();
                                        } catch (error) {
                                            form_state = 'Oops...something has gone wrong.';
                                        }}}>
                                        Delete
                                    </button>
                                </td>
                            {/if}
                            <td>
                                {#if showID == n.id}
                                    <i class="bi bi-chevron-up"></i>
                                {:else}
                                    <i class="bi bi-chevron-down"></i>
                                {/if}
                            </td>
                        </tr>
                        {#if showID == n.id}
                            <tr>
                                <td>Body:</td>
                                <td style="white-space: nowrap; text-overflow:ellipsis; overflow: hidden; max-width:1px;">{n.body}</td>
                            </tr>
                            <tr>
                                <td>Link:</td>
                                <td style="white-space: nowrap; text-overflow:ellipsis; overflow: hidden; max-width:1px;">{n.link}</td>
                            </tr>
                        {/if}
                    {/each}
                </tbody>
            </table>
        {/if}
    </div>
</div>