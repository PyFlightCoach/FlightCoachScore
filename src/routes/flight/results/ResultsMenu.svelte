<script lang="ts">
	import { base } from '$app/paths';
	import { manNames, isComplete, bin } from '$lib/stores/analysis';
	import { activeFlight } from '$lib/stores/shared';
	import { analyseAll, clearAnalysis } from '$lib/analysis/analysis';
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
		class="nav-link"
		on:click={() => {
			clearAnalysis();
			goto(base + '/');
		}}
	>
		Clear
	</button>
	<ul class="nav-item pagination">
		{#if $isComplete && $user && (isNewFlight || ($user.is_superuser && isMyFlight))}
			<a
				class="page-item nav-link {$page.url.pathname.endsWith('upload') ? 'active' : ''}"
				href={base + '/flight/results/upload'}>{$activeFlight ? 'Update' : 'Upload'}</a
			>
		{/if}
		<a
			class="page-item nav-link {$page.url.pathname.endsWith('results') ? 'active' : ''}"
			href={base + '/flight/results'}>Results</a
		>
	</ul>
	{#if $user?.is_superuser}
		<button
			class="nav-link"
			on:click={() => {
				analyseAll(true, true);
			}}
		>
			Optimise All
		</button>
	{/if}
{/if}
