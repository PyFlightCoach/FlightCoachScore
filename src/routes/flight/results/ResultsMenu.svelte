<script lang="ts">
	import { base } from '$app/paths';
	import { manNames, isComplete } from '$lib/stores/analysis';
	import { clearAnalysis } from '$lib/analysis/analysis';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
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
		{#if $isComplete}
			<a
				class="page-item nav-link {$page.url.pathname.endsWith('upload') ? 'active' : ''}"
				href={base + '/flight/upload'}>Upload</a
			>
		{/if}
		<a
			class="page-item nav-link {$page.url.pathname.endsWith('results') ? 'active' : ''}"
			href={base + '/flight/results'}>Results</a
		>
	</ul>
{/if}
