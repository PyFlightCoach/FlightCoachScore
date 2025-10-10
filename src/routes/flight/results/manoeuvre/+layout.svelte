<script lang="ts">
	import { resolve } from '$app/paths';

	import { selManID, analyses, running } from '$lib/stores/analysis';
	import * as nbc from '$lib/stores/navBarContents';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
	nbc.reset([
		{
			name: 'Summary',
			href: resolve('/flight/results/manoeuvre/'),
			icon: 'bi-card-text',
			title: 'Show manoeuvre summary',
			disabled: false
		},
		{
			name: 'Alignment',
			href: resolve('/flight/results/manoeuvre/alignment/'),
			icon: 'bi-arrows-angle-contract',
			title: 'Edit element alignment',
			disabled: false
		},
		{
			name: 'Intra',
			href: resolve('/flight/results/manoeuvre/intra/'),
			icon: 'bi-diagram-3',
			title: 'Show intra downgrades',
			disabled: false
		},
		{
			name: 'Inter',
			href: resolve('/flight/results/manoeuvre/inter/'),
			icon: 'bi-diagram-3-fill',
			title: 'Show inter manoeuvre downgrades',
			disabled: false
		},
		{
			name: 'Positioning',
			href: resolve('/flight/results/manoeuvre/positioning/'),
			icon: 'bi-geo-alt',
			title: 'Show positioning downgrades',
			disabled: false
		},
		{
			name: 'Templates',
			href: resolve('/flight/results/manoeuvre/templates/'),
			icon: 'bi-file-earmark-text',
			title: 'Show templates',
			disabled: false
		},
		{
			name: 'Back',
			href: resolve('/flight/results'),
			icon: 'bi-arrow-left',
			title: 'Back to results',
			disabled: false
		}
	]);

	let man = analyses[$selManID!];
	let isRunning = $derived($running[$selManID!]);
</script>

{#if $man}
	{#if !isRunning}
		{@render children?.()}
	{:else}
		<p>Running ...</p>
	{/if}
{:else}
	<p>No Internal Data</p>
{/if}
