
<script lang='ts'>
   
  import { selManID, analyses, running } from '$lib/stores/analysis';
  import navBarContents from "$lib/stores/navBarContents";
  import Menu from './ManoeuvreMenu.svelte';
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
  $navBarContents = Menu;

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