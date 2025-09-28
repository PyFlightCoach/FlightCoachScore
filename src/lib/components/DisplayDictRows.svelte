<script lang="ts">
	import { objmap } from '$lib/utils/arrays';
  import DDR from '$lib/components/DisplayDictRows.svelte';

	let {
		dict = $bindable()
	}: { dict: Record<string, any> | any[]; } = $props();

	let show: Record<string, boolean> = $state(objmap(dict, () => false));

</script>


{#each Object.entries(dict) as [key, value]}
    <tr>
      {#if value && typeof value === 'object'}
      <th colspan="2" class="p-0">
        <button class="btn btn-outline-secondary w-100" onclick={()=>{show[key]=!show[key]}}>
          {key} 
          {#if show[key]}
            <i class="bi bi-chevron-up"></i>
          {:else}
            <i class="bi bi-chevron-down"></i>
          {/if}
        </button>
      </th>
      {:else}
      <th>{key}</th>
      <td>{value}</td>

      {/if}
    </tr>
    {#if show[key]}
      <DDR bind:dict={dict[key]} />
    {/if}
  {/each}
  <tr><td colspan="2" class="text-center p-0"><hr/></td></tr>