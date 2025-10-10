<script lang="ts">
	import LeaderQuery from '$lib/leaderboards/LeaderQuery.svelte';
	import navBarContents from '$lib/stores/navBarContents';
	import DBMenu from './DBMenu.svelte';
	import { resolve } from '$app/paths';
	import { updateTable } from '$lib/leaderboards/stores';
	import { windowWidth, activeScheduleIDs, allFAVersions } from '$lib/stores/shared';
	import { table_rows } from '$lib/leaderboards/stores';
	import { onMount } from 'svelte';

	const lg = $derived($windowWidth >= 1024);
	$inspect($windowWidth, lg);
	$effect(() => {
		$navBarContents = lg ? DBMenu : undefined;
	});

	onMount(() => {
		if ($table_rows.length === 0) {
			updateTable();
		}
	});
</script>

<div
	id="sidebar"
	class="{!lg ? 'offcanvas offcanvas-start' : 'col-lg-3 show'} bg-light border overflow-scroll"
>
	{#if !lg}
		<div class="offcanvas-header">
			<h5 class="offcanvas-title" id="offcanvasExampleLabel">Search Controls</h5>
			<button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"
			></button>
		</div>
	{/if}

	<LeaderQuery fa_versions={$allFAVersions} schedule_ids={$activeScheduleIDs} />

	<div class="row p-2 justify-content-end">
		<button class="w-50 btn btn-primary" onclick={updateTable} data-bs-dismiss="offcanvas"
			>Submit</button
		>
	</div>
</div>

<div class="col-lg-9 px-0 justify-content-center text-center">
	{#if $table_rows.length}
		<div style="position:relative; height: 100%;">
			<div class="overflow-auto" style="position: absolute; top: 0; left: 0; bottom: 0; right: 0;">
				<slot />
			</div>
		</div>
	{/if}
</div>

{#if !lg}
	<nav class="navbar fixed-bottom navbar-expand-lg bg-body-secondary">
		<div class="container-fluid justify-content-between">
			<div class="col">
				{#if !lg}
					<a
						class="btn btn-primary"
						data-bs-toggle="offcanvas"
						href="#sidebar"
						role="button"
						aria-label="Toggle sidebar"
					>
						<i class="bi bi-list bi-lg py-2 p-1"></i>
					</a>
				{/if}
			</div>

			<a
				class="col nav-link"
				href={resolve('/database/leaderboards')}
				aria-label="Leaderboards"
			>
				<span><i class="bi bi-trophy"></i></span>
			</a>
			<a class="col nav-link" href={resolve('/database/map')} aria-label="Map">
				<span><i class="bi bi-map"></i></span>
			</a>
		</div>
	</nav>
{/if}
