<script lang="ts">
	import LeaderQuery from '$lib/leaderboards/LeaderQuery.svelte';
	import { resolve } from '$app/paths';
	import { updateTable } from '$lib/leaderboards/stores';
	import { windowWidth, activeScheduleIDs, allFAVersions } from '$lib/stores/shared';
	import { table_rows } from '$lib/leaderboards/stores';
	import { onMount } from 'svelte';
	import SideBarLayout from '$lib/components/SideBarLayout.svelte';

	$effect(() => {
		//$navBarContents = lg ? DBMenu : undefined;
	});

	onMount(() => {
		if ($table_rows.length === 0) {
			updateTable();
		}
	});
</script>

<SideBarLayout bp="md">
	{#snippet side()}
		<LeaderQuery fa_versions={$allFAVersions} schedule_ids={$activeScheduleIDs} />

		<div class="row p-2 justify-content-end">
			<button class="w-50 btn btn-primary" onclick={updateTable} data-bs-dismiss="offcanvas"
				>Submit</button
			>
		</div>
	{/snippet}
	{#snippet main()}
		{#if $table_rows.length}
			<div style="position:relative; height: 100%;">
				<div
					class="overflow-auto"
					style="position: absolute; top: 0; left: 0; bottom: 0; right: 0;"
				>
					<slot />
				</div>
			</div>
		{/if}
	{/snippet}
	{#snippet btmNavs()}
		<a
			class="col nav-link"
			href={resolve('/database/query/leaderboards')}
			aria-label="Leaderboards"
		>
			<span><i class="bi bi-trophy"></i></span>
		</a>
		<a class="col nav-link" href={resolve('/database/query/map')} aria-label="Map">
			<span><i class="bi bi-map"></i></span>
		</a>
	{/snippet}
</SideBarLayout>
