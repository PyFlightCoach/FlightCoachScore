<script lang="ts">
	import { base } from '$app/paths';
	import { manNames, selManID, analyses, running } from '$lib/stores/analysis';

	let man = analyses[$selManID!];
	$: isRunning = running[$selManID!];
	const plink = (name: string) => base + '/analysis/results/manoeuvre/' + name;
</script>

<li class="nav-item">
	<ul class="pagination">
		{#if $man || !$isRunning}
			
				<li class="page-item"><a class="nav-link" href={plink('')}>Summary</a></li>
				<li class="page-item"><a class="nav-link" href={plink('alignment')}>Alignment</a></li>
				{#if $man?.scores}
					<li class="page-item"><a class="nav-link" href={plink('intra')}>Intra</a></li>
					<li class="page-item"><a class="nav-link" href={plink('inter')}>Inter</a></li>
					<li class="page-item"><a class="nav-link" href={plink('positioning')}>Positioning</a></li>
					<li class="page-item"><a class="nav-link" href={plink('templates')}>Templates</a></li>
				{/if}
		{/if}
		<li class="page-item"><a class="nav-link" href={base + '/analysis/results'}>Back</a></li>
	</ul>
</li>
