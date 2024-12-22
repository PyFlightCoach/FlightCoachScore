<script lang="ts">
	import { info, infoContent } from '$lib/stores/shared';

	const pages: Record<string, any> = {
		sequences: 'Aerobatic Sequences',
		elements: 'Element Splitting'
	};
</script>

{#if $info}
	<div>
		{#if !$infoContent}
			<h1>Flight Coach Score Supplementary Information</h1>
			<p>
				This menu is intended to help users get the most out of FCScore and to understand how the
				judging process works. It is supplementary to the help documentation which describes how to
				use FCScore.
			</p>

			{#each Object.entries(pages) as [k, v]}
			<button class="btn btn-link" onclick={() => ($info = k)}>{v}</button>
			{/each}
		{:else}
			{@html $infoContent}
		{/if}
		<button class="btn btn-secondary" onclick={()=>{$info=undefined;}}>Close</button>
	</div>
{/if}
