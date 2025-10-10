<script lang="ts">
	import { ContestManager } from '../compthings/ContestManager';
	import { resolve } from '$app/paths';
	import { contestActions, type ContestAction } from './contests';
	import { includes } from 'lodash';
	import { user } from '$lib/stores/user';
	import { reloadDropDownComps, setComp } from '$lib/stores/contests';
	import {getCategories} from '$lib/schedule/categories';
	let {
		competitions,
		full = true,
		actionSubset = contestActions,
    onentered = () => {},
    onselected = () => {}
	}: {
		competitions: ContestManager[];
		full?: boolean;
		actionSubset?: ContestAction[];
    onentered?: () => void;
    onselected?: (comp: ContestManager) => void;
	} = $props();


  let categories = $derived(getCategories());

</script>

<div class="table-responsive">
	<table class="table table-bordered text-nowrap text-center table-sm">
		<thead class="table-dark">
			<tr>
				<th class="text-start">Name</th>
        <th>Type</th>
				<th>CD</th>
				{#if full}<th>Start Date</th>
					<th>End Date</th>
					<th>FA Version</th>
					<th>Open</th>
				{/if}
				<th colspan={actionSubset.length}></th>
			</tr>
		</thead>
		<tbody>
      {#if competitions.length === 0}
        <tr><td colspan={8 + actionSubset.length} class="text-center">No Competitions Found</td></tr>
      {/if}
			{#each competitions as comp}
				<tr class="{comp.iAmCompeting ? 'table-success' : ''}">
					<th  class="text-start">{comp.summary.name}</th>
          <td>
            {#await categories}
              ...
            {:then cats}
              {cats.find(c => c.category_id === comp.summary.category_id)?.category_name.toUpperCase()}
            {/await}
          </td>
					<td>{comp.summary.directors?.map((d) => d.name)}</td>
					{#if full}
            <td>{comp.summary.client_meta?.start_date || comp.summary.date_start || '-'}</td>
						<td>{comp.summary.client_meta?.end_date ||comp.summary.date_end || '-'}</td>
						<td>{comp.summary.fa_version}</td>
						<td>{comp.summary.is_open_now ? 'Yes' : 'No'}</td>{/if}

					{#if includes(actionSubset, 'View')}
						<td class="p-0 text-center">
							<a
								class="btn btn-outline-primary b-0 w-100 tex-nowrap"
								href="{resolve('/competition/view/')}?id={comp.summary.id}"
								data-sveltekit-preload-data="tap"
							>
								{comp.isMyComp ? 'Edit' : 'View'}
							</a>
						</td>
					{/if}
					{#if includes(actionSubset, 'Enter')}
						<td class="p-0 text-center">
							<button
								class="btn btn-outline-{comp.summary.add_rules?.cd_and_self_add && !comp.iAmCompeting
									? 'primary'
									: 'secondary'} b-0 w-100 tex-nowrap"
								onclick={() => {
									comp
										.addPilot($user!.id)
                    .then(reloadDropDownComps)
										.then(onentered)
										.catch((e) =>
											alert('Error entering competition: ' + e.response?.data?.detail || e.message)
										);
								}}
								data-sveltekit-preload-data="tap"
								disabled={!comp.summary.add_rules?.cd_and_self_add || comp.iAmCompeting}
							>
								Enter
							</button>
						</td>
					{/if}
					{#if includes(actionSubset, 'Select')}
						<td class="p-0 text-center b-0">
							<button
                disabled={!comp.iAmCompeting && !comp.isMyComp}
								class="btn btn-outline-primary w-100"
								onclick={() => {
									ContestManager.load(comp.summary.id).then(onselected);
								}}
							>
								Select
							</button>
						</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
