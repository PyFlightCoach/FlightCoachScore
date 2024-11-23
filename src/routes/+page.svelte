<script lang="ts">
	import navBarContents from '$lib/stores/navBarContents';
	import { analysisServer, dbServer } from '$lib/api';
	import { onMount } from 'svelte';
	import { version } from '$app/environment';
	import { user } from '$lib/stores/user';

	$navBarContents = undefined;

	let aSVersion: string = $state('not connected');

	const getServerVersions = async () => {
		aSVersion = await analysisServer.get('version');
	};

	onMount(getServerVersions);
</script>

<div class="container-fluid text-center mt-5" style="max-width:800px; ">
	<div class="row align-items-center">
		<h4>Welcome to Flight Coach Score</h4>
		<p>Prepare to discover that everyone else is rubbish at aerobatics too!</p>
		<p>
			Flight Coach Score facilitates automatic judging of aerobatic flights and offers a place to
			share your scores.
		</p>

		<table class="table table-sm">
			<tbody>
				<tr>
					<td>Client Version:</td>
					<td>{version}</td>
				</tr>
				<tr>
					<td>Analysis Version:</td>
					<td
						role="button"
						onclick={() => {
							analysisServer
								.get('version')
								.then((res) => {
									aSVersion = res;
								})
								.catch(() => {
									aSVersion = 'not connected';
								});
						}}
					>
						{aSVersion}
					</td>
				</tr>
				<tr>
					<td>User:</td>
					<td
            role="button"
						onclick={() => {
							dbServer
								.get('users/me')
								.then((res) => {
									$user = res;
								})
								.catch(() => {
									$user = undefined;
								});
						}}
					>
						{#if $user}
							{`${$user.first_name} ${$user.last_name}` || 'not connected'}
						{:else}
							not logged in
						{/if}
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
