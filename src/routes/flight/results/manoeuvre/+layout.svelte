<script lang="ts">
	import { resolve } from '$app/paths';
	import { selManID, analyses, running } from '$lib/stores/analysis';

	interface Props {
		children?: import('svelte').Snippet;
	}
	let { children }: Props = $props();
	
</script>

{#if $running[$selManID!]}
	...running
	<div class="col-auto spinner-border" role="status"></div>
{:else}
	{@render children()}
{/if}
