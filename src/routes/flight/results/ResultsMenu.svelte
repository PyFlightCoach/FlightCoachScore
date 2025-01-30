<script lang="ts">
	import { base } from '$app/paths';
	import { manNames, isComplete, bin } from '$lib/stores/analysis';
	import { activeFlight } from '$lib/stores/shared';
	import { analyseAll, clearAnalysis, clearDataLoading } from '$lib/flight/analysis';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { user } from '$lib/stores/user';

	$: userId = $user?.id.replaceAll('-', '');

	$: isNewFlight = $bin && !$activeFlight;
	$: isMyFlight =
		userId == $activeFlight?.meta.pilot_id || userId == $activeFlight?.meta.contributor_id || isNewFlight;
	$: console.debug('isNewFlight', isNewFlight, 'isMyFlight', isMyFlight, 'user id', userId, 'activeFlight', $activeFlight, 'isComplete', $isComplete);
</script>

{#if $manNames && $manNames.length > 0}
	<button
		class="col-auto nav-item nav-link"
    title="clear all analysis data"    
    data-bs-toggle="tooltip"
		on:click={() => {
			clearDataLoading();
			goto(base + '/');
		}}
	>
		Clear
	</button>
	
		<a
			class="col-auto page-item nav-link {$page.url.pathname.endsWith('results') ? 'active' : ''}"
			href={base + '/flight/results'}>Results</a
		>
	
	{#if $user?.is_superuser}
		<button
			class="col-auto nav-link"
			on:click={() => {
				analyseAll(true, true);
			}}
		>
			Optimise All
		</button>
	{/if}
{/if}
