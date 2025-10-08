<script lang="ts">
	import { dbServer } from '$lib/api/api.js';
	import type { DBUser } from '$lib/stores/user';
	import Popup from '$lib/components/Popup.svelte';
	import { prettyPrintHttpError } from '$lib/utils/text';

	let users: DBUser[] | undefined = $state();

	function loadUsers() {
		dbServer.get('users/list').then((res) => {
			users = res.data.results as DBUser[];
		});
	}
	loadUsers();
	let activeUser: DBUser | undefined = $state();

	async function patchUser(user: DBUser, item: any) {
		if (
			confirm(
				`Are you sure you want to ${Object.keys(item)[0]} ${Object.values(item)[0]} user ${user.first_name} ${user.last_name}?`
			)
		) {
			dbServer
				.patch(`users/su_patch/${user.id}`, item)
				.then((res) => {
					activeUser = res.data;
					loadUsers();
				})
				.catch((e) => prettyPrintHttpError(e));
		}
	}

	async function deleteUser(user: DBUser) {
		if (confirm(`Are you sure you want to delete user ${user.first_name} ${user.last_name}?`)) {
			dbServer
				.delete('users/' + user.id)
				.then((res) => {
					activeUser = undefined;
					loadUsers();
				})
				.catch((e) => alert(prettyPrintHttpError(e)));
		}
	}

	async function emailUser(user: DBUser, formData: FormData) {
		if (
			confirm(
				`Are you sure you want to email user ${activeUser!.first_name} ${activeUser!.last_name}?`
			)
		) {
			dbServer.patch('users/send_email/' + activeUser!.id, formData).catch((e) => {
				alert(prettyPrintHttpError(e));
			});
		}
	}
</script>

<div class="table-responsive">
	<table class="table table-sm table-striped text-center">
		<thead class="table-dark" style="z-index:-1">
			<tr>
				<th>#</th>
				<th>Name</th>
				<th>Country</th>
				<th>Status</th>
			</tr>
		</thead>
		<tbody>
			{#if users}
				{#each users! as u, i}
					<tr
						role="button"
						onclick={() => {
							activeUser = u;
						}}
					>
						<td>{i + 1}</td>
						<td>{u.first_name} {u.last_name}</td>
						<td>{u.country}</td>
						<td>
							{#if u.is_active}A{:else}-{/if}
							{#if u.is_verified}V{:else}-{/if}
							{#if u.is_superuser}S{:else}-{/if}
							{#if u.is_cd}C{:else}-{/if}
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

<Popup bind:show={activeUser}>
	<div class="row">
		<div class="col">
			{#each Object.entries(activeUser!) as [k, v]}
				<small>{k}: {v}</small><br />
			{/each}
		</div>
	</div>

	<form
		method="POST"
		class="border rounded p-1 mt-3"
		onsubmit={(e) => emailUser(activeUser!, new FormData(e.currentTarget as HTMLFormElement))}
	>
		<textarea class="form-control" id="subject" name="subject" title="subject" rows="1" required
		></textarea>
		<textarea class="form-control" id="body" name="body" title="body" rows="6"></textarea>

		<div class="row">
			<div class="col-auto">
				<div class="mt-2">
					<div class="custom-check checkbox-lg">
						<input
							class="custom-check-input"
							type="checkbox"
							id="body_is_html"
							name="body_is_html"
							checked
						/>
						<label class="custom-check-label" for="body_is_html">
							Body is html (not plain text)
						</label>
					</div>
				</div>

				<div class="mt-2">
					<div class="custom-check checkbox-lg">
						<input
							class="custom-check-input"
							type="checkbox"
							id="cc_admin"
							name="cc_admin"
							checked
						/>
						<label class="custom-check-label" for="cc_admin"> Cc: admin@fcscore.org </label>
					</div>
				</div>

				<div class="mt-2 d-none">
					<div class="custom-check checkbox-lg">
						<input
							class="custom-check-input"
							type="checkbox"
							id="send_to_all_active_users"
							name="send_to_all_active_users"
						/>
						<label class="custom-check-label" for="send_to_all_active_users">
							Actually, send this to all active users (CAREFUL!)
						</label>
					</div>
				</div>
			</div>

			<button type="submit" class="col w-100 mt-2 btn btn-outline-primary me-3">Send Email</button>
		</div>
	</form>

	<div class="btn-group mt-3">
		<button
			type="button"
			class="btn btn-outline-primary"
			onclick={() => {
				patchUser(activeUser!, { is_active: !activeUser!.is_active });
			}}>{activeUser!.is_active ? 'Deactivate' : 'Activate'}</button
		>

		{#if activeUser?.is_active}
			<button
				type="button"
				class="btn btn-outline-primary"
				onclick={() => {
					patchUser(activeUser!, { is_cd: !activeUser!.is_cd });
				}}>{activeUser!.is_cd ? 'Remove CD' : 'Make CD'}</button
			>
			<button
				type="button"
				class="btn btn-outline-primary"
				onclick={() => {
					patchUser(activeUser!, { is_superuser: !activeUser!.is_superuser });
				}}
			>
				{activeUser!.is_superuser ? 'Remove Super User' : 'Make Superuser'}
			</button>

			<button
				type="button"
				class="btn btn-outline-primary"
				onclick={() => {
					deleteUser(activeUser!);
				}}>Delete</button
			>
		{/if}
		<button type="button" class="btn btn-outline-primary" onclick={() => {}}> Send Email </button>
	</div>
</Popup>
