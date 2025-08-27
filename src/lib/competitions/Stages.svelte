<script lang="ts">
	import type { CompThingSummary } from "./compInterfaces";
  import StageManager from './StageManager.svelte';
  import {activeComp} from '$lib/stores/contests';
  
  let {parentID, stages=$bindable()} : {parentID: string;stages: CompThingSummary[] | undefined} = $props();

  let showID: number | undefined = $state();
  let createStage: boolean = $state(false);

</script>


<div class="table-responsive">
	<table class="table table-striped text-center">
		<thead class="table-dark" style="z-index:-1">
			<tr>
				<th scope="col" colspan="2">Stages</th>
			</tr>
		</thead>
		<tbody>
			{#each stages || [] as stage, i}
				<tr
          role="button"
          onclick={() => {
            if (showID == i) {
              showID = undefined;
            } else {
              showID = i;
            }
          }}
        >
					<td>{stage.name}</td>
					<td>
						{#if showID == i}
							<i class="bi bi-chevron-up"></i>
						{:else}
							<i class="bi bi-chevron-down"></i>
						{/if}
					</td>
				</tr>
        {#if showID==i}
          <tr>
            <td colspan="2">
              <StageManager parentID={stage.id} stage={stage} />
            </td>
          </tr>
        {/if}
			{/each}
      <tr role="button" onclick={()=>{showID=undefined; createStage=!createStage;}}>
        <td>Create New Stage</td>
        <td>+</td>
      </tr>
      {#if createStage}
      <tr>
        <td colspan="2">
        <StageManager parentID={$activeComp.id} />
      </td>
      </tr>
      {/if}
		</tbody>
	</table>
</div>
