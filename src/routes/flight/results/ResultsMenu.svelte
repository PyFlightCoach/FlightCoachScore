<script lang="ts">
	import { resolve } from '$app/paths';
	import { manNames} from '$lib/stores/analysis';
	import { analyseAll, clearDataLoading } from '$lib/flight/analysis';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { user } from '$lib/stores/user';	
</script>

{#if $manNames && $manNames.length > 0}
	<button
		class="col-auto nav-item nav-link"
    title="clear all analysis data"    
    data-bs-toggle="tooltip"
		onclick={() => {
			clearDataLoading();
			goto(resolve('/'));
		}}
	>
		Clear
	</button>
	
		<a
			class="col-auto page-item nav-link {page.url.pathname.endsWith('results') ? 'active' : ''}"
			href={resolve('/flight/results')}>Results</a
		>
	
	{#if $user?.is_superuser}
		<button
			class="col-auto nav-link"
			onclick={() => {
				analyseAll(true, true);
			}}
		>
			Optimise All
		</button>
	{/if}
{/if}
