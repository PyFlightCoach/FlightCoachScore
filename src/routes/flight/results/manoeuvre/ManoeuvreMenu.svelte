<script lang="ts">
	import { resolve } from '$app/paths';
	import { selManID, analyses, running } from '$lib/stores/analysis';
  import {page} from '$app/state';

	let man = analyses[$selManID!];
	
  const isRunning = $derived($running[$selManID!]);
	const plink = (name: string) => resolve("/flight/results/manoeuvre/" + name) ;


  const isLoaded = (name: string) => page.url.pathname.endsWith(name + '/') ? 'active' : '';
  

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
<a class="col-auto nav-link" href={resolve("/flight/results")}>Back</a>
