
<script lang="ts">

	import type { CompThingSummary } from "./compInterfaces";
  import StageManager from './StageManager.svelte';
  import {activeComp} from '$lib/stores/contests';
  import RoundManager from "./RoundManager.svelte";
  let {parentID, rounds=$bindable()} : {parentID: string;rounds: CompThingSummary[] | undefined} = $props();

  let showID: number | undefined = $state();
  let createRound: boolean = $state(false);



</script>



<table class="table">
	<thead>
		<tr>
			<th colspan="2">Rounds</th>
		</tr>
	</thead>
	<tbody>
		{#if rounds}
			{#each rounds as round, i}
				<tr>
					<td>{round.name}</td>
					<td><i class="bi bi-chevron-down"></i></td>
				</tr>
			{/each}
		{/if}
    <tr role="button" onclick={()=>{showID=undefined; createRound=!createRound;}}>
        <td>Create New Round</td>
        <td>+</td>
    </tr>
    {#if createRound}
        <RoundManager parentID={parentID} />
    {/if}
	</tbody>
</table>
