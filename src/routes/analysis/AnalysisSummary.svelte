<script lang="ts">
	import {manNames} from '$lib/stores/analysis';
  import ManSummary from './ManSummary.svelte';
 </script>

<table class="table table-sm">
  <thead>
    <tr>
      <th>#</th>
      <th>Manoeuvre</th>
      <th>K</th>
      <th>Intra</th>
      <th>Inter</th>
      <th>Position</th>
      <th>Score</th>
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

