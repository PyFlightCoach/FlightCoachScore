<script lang="ts">
	import navBarContents from '$lib/stores/navBarContents';
	import { analysisServer, dbServer } from '$lib/api';
	import { onMount } from 'svelte';
	import { version } from '$app/environment';
	$navBarContents = undefined;

	let aSVersion: string;
	let dbVersion: string;
	const getServerVersions = async () => {
		aSVersion = await analysisServer.get('/version');
		dbVersion = await dbServer.get('/version');
	};

	onMount(getServerVersions);
</script>

<div class="container-fluid text-center mt-5" style="max-width:800px; ">
	<div class="row align-items-center ">
		<h4>Welcome to Flight Coach Score</h4>
		<p>Prepare to discover that everyone else is rubbish at aerobatics too!</p>
		<p>
			Flight Coach Score facilitates automatic judging of aerobatic flights and offers a place to
			share your scores.
		</p>

		<div class="container" style="width:350px">
			<div class="row">
				<div class="col-sm">Client:</div>
				<div class="col-sm">{version}</div>
			</div>
			<div class="row">
				<div class="col-sm text-right">Analysis:</div>
				<div class="col-sm">
					<button on:click={getServerVersions}> {aSVersion || 'not connected'}</button>
				</div>
			</div>
			<div class="row">
				<div class="col-sm text-right">Database:</div>
				<div class="col-sm">
					<button on:click={getServerVersions}> {dbVersion || 'not connected'}</button>
				</div>
			</div>
		</div>
	</div>
</div>



