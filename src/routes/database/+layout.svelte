<script lang="ts">
	import LeaderQuery from '$lib/leaderboards/LeaderQuery.svelte';
	import { updateTable } from '$lib/leaderboards/stores';
	import { activeScheduleIDs, allFAVersions } from '$lib/stores/shared';
	import { table_rows } from '$lib/leaderboards/stores';
	import { onMount } from 'svelte';
	import SideBarLayout from '$lib/components/SideBarLayout.svelte';
	import { resolve } from '$app/paths';
	import * as nbc from '$lib/stores/navBarContents';
	import { breakPoints, breakPoint } from '$lib/stores/shared';

	onMount(() => {
		if ($table_rows.length === 0) {
			updateTable();
		}
	});

	//	onNavigate(() => {$navBarContents = []});

	nbc.reset([
		{
			href: resolve('/database/leaderboards/'),
			name: 'Leaderboards',
			title: 'Show results in a table',
			icon: 'bi-trophy'
		} as nbc.NavBarPage,
		{
			href: resolve('/database/map/'),
			name: 'Map',
			title: 'Show results in a map',
			icon: 'bi-map'
		} as nbc.NavBarPage
	]);
	nbc.checkUrl();
</script>

<SideBarLayout bp="lg" sideBarWidth={4}>
	{#snippet side()}
		<LeaderQuery fa_versions={$allFAVersions} schedule_ids={$activeScheduleIDs} />

		<div class="row p-2 justify-content-end">
			<button
				class="w-50 btn btn-primary"
				onclick={updateTable}
				data-bs-dismiss={breakPoints['lg'] > breakPoints[$breakPoint] ? 'offcanvas' : undefined}
				>Submit</button
			>
		</div>
	{/snippet}
	{#snippet main()}
		{#if $table_rows.length}
			<slot />
		{/if}
	{/snippet}
</SideBarLayout>
