
<script lang='ts'>
   
  import { selManID, analyses, running } from '$lib/stores/analysis';
  import {base} from '$app/paths';
  import navBarContents from "$lib/stores/navBarContents";
  import Menu from './ManoeuvreMenu.svelte';
  $navBarContents = Menu;

  let man = analyses[$selManID!];
  let isRunning = running[$selManID!]
  
</script>

{#if $man}
  {#if !$isRunning}
    <slot />
  {:else}
    <p>Running ...</p>
  {/if}
{:else}
  <p>No Internal Data</p>
{/if}

