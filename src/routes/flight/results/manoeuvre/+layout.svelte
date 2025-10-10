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
			name: 'View',
			href: resolve('/flight/results/manoeuvre/'),
			icon: 'bi-card-text',
			title: 'View Manoeuvre',
			disabled: false
		},
		{
			name: 'Segmentation',
			href: resolve('/flight/results/manoeuvre/segmentation/'),
			icon: 'bi-align-center',
			title: 'Edit Element Segmentation',
			disabled: false
		},
		{
			name: 'Intra',
			href: resolve('/flight/results/manoeuvre/intra/'),
			icon: 'bi-columns-gap',
			title: 'Intra Element Downgrades',
			disabled: false
		},
		{
			name: 'Inter',
			href: resolve('/flight/results/manoeuvre/inter/'),
			icon: 'bi-columns',
			title: 'Inter Element Downgrades',
			disabled: false
		},
		{
			name: 'Positioning',
			href: resolve('/flight/results/manoeuvre/positioning/'),
			icon: 'bi-box',
			title: 'Box downgrades',
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
  nbc.checkUrl();
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
