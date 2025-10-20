<script lang="ts">
	import type { ContestManager } from '$lib/competitions/compthings/ContestManager';
	import UserSearch from '$lib/components/UserSearch.svelte';
	import { setComp } from '$lib/stores/contests';
	import { user } from '$lib/stores/user';
	import { compareUUIDs, prettyPrintHttpError } from '$lib/utils/text';

	let { competition }: { competition: ContestManager } = $props();

	let showAddDirector = $state(false);
  $inspect(competition.summary.directors, $user?.id);
</script>

<div class="container border rounded p-1 mb-2">
	<small class="px-2">Contest Directors</small>
	<table class="table table-sm p-0 rounded mb-0">
		<tbody>
			{#each competition.summary.directors || [] as director}
				<tr class="px-2 text-nowrap">
					<td>{director.name}</td>
					<td>{director.country}</td>
					{#if competition.isMyComp && (competition.summary.directors || []).length > 1 && (compareUUIDs(director.id, $user!.id) || $user!.is_superuser)}
						<!-- Disabled for now, removing directors is not implemented on the backend -->
						<td class="p-0">
							<button
								class="btn btn-sm btn-outline-secondary w-100"
								disabled={competition.summary.directors!.length == 1}
                onclick={() =>
                  competition
                    .removeDirector(director.id!)
                    .then((comp) => {
                      setComp(comp);
                    })
                    .catch((e) => {
                      alert(prettyPrintHttpError(e));
                    })}
              >
                Remove
              </button>
						</td>
					{/if}
				</tr>
			{/each}
			{#if competition.isMyComp}
				<tr class="px-2 text-nowrap">
					<td colspan={competition.isMyComp ? 3 : 2} class="p-0">
						<button
							class="btn btn-sm btn-outline-secondary w-100"
							onclick={() => (showAddDirector = !showAddDirector)}>
              Add Director
              {#if showAddDirector}
            <i class="bi bi-chevron-up"></i>
          {:else}
            <i class="bi bi-chevron-down"></i>
          {/if}
          </button
						>
					</td>
				</tr>
				{#if showAddDirector}
					<tr class="px-2 text-nowrap">
						<td colspan={competition.isMyComp ? 3 : 2} class="p-0 px-1">
							<UserSearch
								allowFake={false}
                only_cds={true}
								onadded={(user) =>
									competition
										.addDirector(user.id!)
										.then((comp) => {
											showAddDirector = false;
											setComp(comp);
										})
										.catch((e) => {
											alert(prettyPrintHttpError(e));
										})}
							/>
						</td>
					</tr>
				{/if}
			{/if}
		</tbody>
	</table>
</div>
