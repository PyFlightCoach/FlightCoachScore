<script lang="ts">
	import { user, type DBUser } from '$lib/stores/user';
	import { dbServer } from '$lib/api';
	import TextInput from '$lib/components/TextInput.svelte';
	import { activeComp } from '$lib/stores/contests';

	let {
		users,
		compID,
		onadded = () => {}
	}: { users: DBUser[]; compID: string; onadded: () => void } = $props();

	let formState: string | undefined = $state();
	let email: string | undefined = $state();
	let pilotMayExist: boolean = $state(true);
	let pilotName: string | undefined = $state();
</script>

{#if formState}
	<div class="row mt-4">
		<p><mark>{formState}</mark></p>
	</div>
{/if}
<div class="row p-2">
	<TextInput name={'email'} bind:value={email} />
	{#if !pilotMayExist}
		<TextInput name={'name'} bind:value={pilotName} />
	{/if}
</div>
<div class="row p-2">
	<button
		class="col btn btn-outline-primary"
		onclick={() => {
			const founduser = users.find((u) => u.email == email);
			if (founduser) {
				dbServer
					.post(`competition/add_competitor/`, {
						comp_id: compID,
						user_id: founduser.id
					})
					.then((res) => {
            $activeComp=res.data;
						onadded();
					})
					.catch((e) => {
						formState = `Failed to add ${founduser.first_name} ${founduser.last_name} ${e}`;
					});
			} else {
				if (pilotMayExist) {
					formState = 'Pilot not found in DB, enter name to create dummy pilot.';
					pilotMayExist = false;
				} else {
					if (pilotName) {
						dbServer
							.post(`competition/add_competitor/`, {
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
								formState = `Failed to add ${pilotName} ${e}`;
							});
					}
				}
			}
		}}>Add</button
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
