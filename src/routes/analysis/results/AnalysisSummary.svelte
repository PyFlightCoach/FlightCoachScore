<script lang="ts">
	import {manNames} from '$lib/stores/analysis';
  import ManSummary from './ManSummary.svelte';
 </script>

<table class="table table-sm table-hover " data-sveltekit-preload-data="tap">
  <thead>
    <tr>
      <th scope='col' >#</th>
      <th scope='col' class='text-centre'>Name</th>
      <th scope='col' class='text-centre'>K</th>
      <th scope='col' class='text-centre'>Intra</th>
      <th scope='col' class='text-centre'>Inter</th>
      <th scope='col' class='text-centre'>Position</th>
      <th scope='col' >Score</th>
    </tr>
  </thead>
  <tbody>
  {#if $manNames}
    {#each $manNames as mname, i}
      <ManSummary id={i}/>
    {/each}
  {/if}
</tbody>
</table>

