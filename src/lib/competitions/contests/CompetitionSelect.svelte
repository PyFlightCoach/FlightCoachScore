<script lang="ts">
	import { ContestManager } from '$lib/competitions/compthings/ContestManager';
	import { getCategories } from '$lib/schedule/categories';

	import { listComps, type ContestGroup, type ContestAction } from './contests';
	import CompetitionTable from './CompetitionTable.svelte';
	import type { DBSchedule } from '$lib/schedule/db';
  
	let {
		competition = $bindable(),
		fullDisplay = $bindable(true),
		filterSubset = ['All', 'Mine', 'Open', 'Entered', 'Ready'],
		actionSubset = ['View', 'Edit', 'Enter', 'Select'],
		schedule = undefined,
    userID = undefined,
    bootTime = undefined,
    uploadTime = undefined,
		onselected = () => {},
		onentered = () => {}
	}: {
		competition?: ContestManager | undefined;
		fullDisplay?: boolean;
		filterSubset?: ContestGroup[];
		actionSubset?: ContestAction[];
		schedule?: DBSchedule | undefined;
    userID?: string | undefined;
    bootTime?: Date | undefined;
    uploadTime?: Date | undefined;
		onselected?: () => void;
		onentered?: () => void;
	} = $props();

	
	let categories = $derived(getCategories());
  let category = $state("All");
  
	let group: ContestGroup = $state(filterSubset[0]);

	const competitions: Promise<ContestManager[]> = $derived(
		listComps(group, category === 'All' ? undefined : category, true).then((comps) => {
			return comps.filter(
				(c) => c.checkCanUpload(bootTime, uploadTime, category=="Open" ? userID : undefined, schedule?.schedule_id)
			)
    })
	);

	
</script>

<div class="container-auto p-0">
	<div class="row p-2">
		<div class="col col-auto btn-group" role="group">
			{#each filterSubset as grp}
				<button
					class="col btn btn-outline-secondary {group === grp ? 'active' : ''}"
					onclick={() => {
						group = grp;
					}}
				>
					{grp}
				</button>
			{/each}
		</div>

		{#if !schedule}
			{#await categories}
				...
			{:then cats}
				<div class="col col-auto">
					<div class="row">
						<label for="category-select" class="col-auto col-form-label">Category:</label>
						<select class="col form-input form-select" id="category-select" bind:value={category}>
							<option value="All">ALL</option>
							{#each cats as cat}
								<option value={cat.category_id}>{cat.category_name.toUpperCase()}</option>
							{/each}
						</select>
					</div>
				</div>
			{/await}
		{/if}
	</div>
	<div class="row-auto table-responsive p-0">
		{#await competitions}
			...Loading Competitions
		{:then comps}
			<CompetitionTable
				competitions={comps}
				full={fullDisplay}
				onselected={(comp) => {
					competition = comp;
					onselected();
				}}
				{actionSubset}
				onentered={()=>{
          if (filterSubset.includes("Ready")) {
            group="Ready";
          }
          onentered();
        }}
			/>
		{/await}
	</div>
</div>
