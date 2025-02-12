<script lang="ts">
	import { base } from '$app/paths';
	import { manNames, selManID, analyses, running } from '$lib/stores/analysis';
  import {page} from '$app/stores';

	let man = analyses[$selManID!];
	$: isRunning = $running[$selManID!];
	const plink = (name: string) => base + '/flight/results/manoeuvre/' + name;


  const isLoaded = (name: string) => $page.url.pathname.endsWith(name + '/') ? 'active' : '';
  

</script>

{#if $man || !isRunning}
    <a class="col-auto nav-link {isLoaded('manoeuvre')}" href={plink('')}>Summary</a>
    <a class="col-auto nav-link {isLoaded('alignment')}" href={plink('alignment')}>Alignment</a>
    {#if $man?.scores}
      <a class="col-auto nav-link {isLoaded('intra')}" href={plink('intra')}>Intra</a>
      <a class="col-auto nav-link {isLoaded('inter')}" href={plink('inter')}>Inter</a>
      <a class="col-auto nav-link {isLoaded('positioning')}" href={plink('positioning')}>Positioning</a>
      <a class="col-auto nav-link {isLoaded('templates')}" href={plink('templates')}>Templates</a>
    {/if}
{/if}
<a class="col-auto nav-link" href={base + '/flight/results'}>Back</a>
