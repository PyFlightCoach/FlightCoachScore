<script lang="ts">
    import {dbServer} from '$lib/api/api'

    let form_state: string | undefined;

    async function _handleSubmit(event: Event) {
        try {
            const fdata = new FormData(event.currentTarget as HTMLFormElement);

            await dbServer.post('auth/forgot-password', {email: fdata.get('email')});

            form_state = 'Please check your email for the reset password message.';
            
        } catch (error) {
            form_state = 'Oops...something has gone wrong. Please try again later.';
        };
    }
</script>


<div class="container" style="max-width: 600px">

    {#if form_state}
    <div class="row mt-4">
        <p><mark>{form_state}</mark></p>
    </div>
    {/if}
    
    <div class="row mt-4">
        <p class="lead">
    Please enter your email address and click the reset password button.  We'll send you an email containing a link to reset your password.
        </p>
    </div>

    <form class="row mt-4" method="POST" on:submit|preventDefault={_handleSubmit}>
        <div class="mb-3">
            <label for="email" class="form-label">Email address</label>
            <input type="email" class="form-control" id="email" name="email" required>
        </div>
        <div class="mb-3">
            <button type="submit" class="btn btn-primary">Reset Password</button>
        </div>
    </form>
    
</div>

