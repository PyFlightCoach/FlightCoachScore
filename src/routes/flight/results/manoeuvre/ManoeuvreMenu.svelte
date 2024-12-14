<script lang="ts">
	import { base } from '$app/paths';
	import { manNames, selManID, analyses, running } from '$lib/stores/analysis';
  import {page} from '$app/stores';

	let man = analyses[$selManID!];
	$: isRunning = $running[$selManID!];
	const plink = (name: string) => base + '/flight/results/manoeuvre/' + name;


  const isLoaded = (name: string) => $page.url.pathname.endsWith(name) ? 'active' : '';
  

</script>

<li class="nav-item">
	<ul class="pagination">
		{#if $man || !isRunning}
			
				<li class="page-item"><a class="nav-link {isLoaded('manoeuvre')}" href={plink('')}>Summary</a></li>
				<li class="page-item"><a class="nav-link {isLoaded('alignment')}" href={plink('alignment')}>Alignment</a></li>
				{#if $man?.scores}
					<li class="page-item"><a class="nav-link {isLoaded('intra')}" href={plink('intra')}>Intra</a></li>
					<li class="page-item"><a class="nav-link {isLoaded('inter')}" href={plink('inter')}>Inter</a></li>
					<li class="page-item"><a class="nav-link {isLoaded('positioning')}" href={plink('positioning')}>Positioning</a></li>
					<li class="page-item"><a class="nav-link {isLoaded('templates')}" href={plink('templates')}>Templates</a></li>
				{/if}
		{/if}
		<li class="page-item"><a class="nav-link" href={base + '/flight/results'}>Back</a></li>
	</ul>
</li>
