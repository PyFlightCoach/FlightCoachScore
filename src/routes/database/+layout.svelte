<script lang="ts">
	import LeaderQuery from '$lib/leaderboards/LeaderQuery.svelte';
	import { updateTable } from '$lib/leaderboards/stores';
	import { activeScheduleIDs, allFAVersions } from '$lib/stores/shared';
	import { table_rows } from '$lib/leaderboards/stores';
	import { onMount } from 'svelte';
	import SideBarLayout from '$lib/components/SideBarLayout.svelte';
	import { resolve } from '$app/paths';
	import * as nbc from '$lib/stores/navBarContents';
	
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
</SideBarLayout>
