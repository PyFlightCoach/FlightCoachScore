<script lang="ts">
	import { users } from '$lib/stores/user';
	import { dbServer } from '$lib/api';
	import TextInput from '$lib/components/TextInput.svelte';
	import { activeComp } from '$lib/stores/contests';
	import { validateEmail } from '$lib/utils/text';

	let { compID, onadded = () => {} }: { compID: string; onadded?: () => void } = $props();

	let formState: string | undefined = $state();
	let email: string | undefined = $state();
	let pilotMayExist: boolean = $state(true);
	let pilotName: string | undefined = $state();

	let isValid = $state(true);
	
</script>

<small>Enter pilots email address</small>
{#if formState}
	<div class="row mt-4">
		<p><mark>{formState}</mark></p>
	</div>
{/if}
<div class="row p-2">
	<TextInput
		name={'email'}
		bind:value={email}
		title={'Email address of the pilot'}
		validator={validateEmail}
		bind:isValid
    disabled={!pilotMayExist}
	/>
	{#if !pilotMayExist}
		<TextInput name={'name'} bind:value={pilotName} title={'Name of the pilot'} />
	{/if}
</div>
<div class="row p-2">
	<button
		class="col btn btn-outline-primary"
		onclick={() => {
			const founduser = $users.find((u) => u.email == email);
			if (founduser) {
				dbServer
					.post(`competition/competitor/`, {
						comp_id: compID,
						user_id: founduser.id
					})
					.then((res) => {
						$activeComp = res.data;
						onadded();
					})
					.catch((e) => {
						formState = `Failed to add ${founduser.first_name} ${founduser.last_name}. ${e.response?.data?.detail || e}`;
					});
			} else {
				if (pilotMayExist) {
					formState = 'Pilot not found in DB, enter name to create dummy pilot.';
					pilotMayExist = false;
				} else {
					if (pilotName) {
						dbServer
							.post(`competition/competitor/`, {
								comp_id: compID,
								user_id: email,
								name_override: pilotName
							})
							.then(() => {
								alert(
									'add code to email prospective user here, or perhaps just generate a linking code'
								);
								onadded();
							})
							.catch((e) => {
                console.error(e);
								formState = `Failed to add ${pilotName}. ${e.response?.data?.detail || e}`;
							});
					}
				}
			}
		}} disabled={!isValid}>Add</button
	>
	<button
		class="col btn btn-outline-primary"
		onclick={() => {
			email = '';
			pilotMayExist = true;
			pilotName = undefined;
			formState = undefined;
		}}>clear</button
	>
</div>
