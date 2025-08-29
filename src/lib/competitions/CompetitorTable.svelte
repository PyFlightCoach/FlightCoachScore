<script lang="ts">
	import { type Competitor } from '$lib/competitions/compInterfaces';
  import AddCompetitor from './AddCompetitor.svelte';
  import { activeComp } from '$lib/stores/contests';
	import {dbServer} from '$lib/api';
  
	let { competitors }: { competitors: Competitor[] } = $props();

	let showID: number | undefined = $state();
</script>

<div class="table-responsive">
	<table class="table table-striped text-center">
		<thead class="table-dark" style="z-index:-1">
			<tr>
				<th scope="col" colspan="2">Competitors</th>
			</tr>
		</thead>
		<tbody>
			{#each competitors as competitor, i}
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
					<td>{competitor.name}</td>
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
              <button class="btn btn-outline-secondary">Send Email</button>
              <button class="btn btn-outline-secondary">Delete</button>

            </td>
          </tr>
        {/if}
			{/each}
      <tr>
        <td colspan="2">
        <AddCompetitor
          compID={$activeComp.id}
          onadded={() => {
            dbServer.get(`competition/${$activeComp.id}`).then((res) => {
              $activeComp = res.data;
            });
          }}
        />
      </td>
      </tr>
		</tbody>
	</table>
</div>
