<script lang="ts">
	import type { ContestManager } from '../compthings/ContestManager';
	import CheckInput from '$lib/components/CheckInput.svelte';
	import type { PilotManager } from '../competitors/PilotManager';
	import Popup from '$lib/components/Popup.svelte';
	import CompetitionSelect from '../contests/CompetitionSelect.svelte';
	import { user } from '$lib/stores/user';
	import type { DBSchedule } from '$lib/schedule/db';

	let {
		competition = $bindable(),
		pilotID = $bindable(),
		round = $bindable(),
		schedule = $bindable()
	}: {
		competition: ContestManager | undefined;
		pilotID?: string | undefined;
		round?: ContestManager | undefined;
		schedule?: DBSchedule | undefined;
	} = $props();
  
	let showForm: boolean = $state(false);
  let showCompSelect: boolean = $state(false);

	let openRounds = $derived(competition?.openRounds(schedule?.schedule_id) || []);
  $inspect(openRounds); 
	let openRound = $derived(
		competition?.children
			.find((s) => s.summary.is_open_now)
			?.children.find((r) => r.summary.is_open_now)
	);

	const nextPilot = $derived(openRound?.competitors.find((c) => c.competitor.raw_score === null));

	// svelte-ignore state_referenced_locally
	let competitor: PilotManager | undefined = $state(nextPilot);

	$effect(() => {
		pilotID = competitor?.competitor.id;
	});

</script>

<CheckInput
	name="Link to Competition after upload"
	bind:checked={showForm}
	onchange={(e) => {
		const target = e.target as HTMLInputElement;
		round = target?.checked ? openRound : undefined;
		competitor = target?.checked ? competitor : undefined;
	}}
/>

{#if showForm}
	<div class="row mb-2 px-2">
		<button class="btn btn-outline-secondary col"
      onclick={() => { showCompSelect = true; }}
    >
			{competition?.summary.name || 'Select Competition'}
		</button>
	</div>

  <Popup bind:show={showCompSelect} >
    <CompetitionSelect 
      bind:competition={competition} 
      fullDisplay={false} 
      filterSubset={['Ready', 'Open']}
      actionSubset={['Enter', 'Select']}
      onselected={()=>{showCompSelect=false; round=openRounds[0]}}
      {schedule}
    />
  </Popup>

	{#if competition && competition.summary.is_open_now}
		<div class="row mb-2 px-2">
			<label class="col-auto col-form-label" for="selectRound">Select Round:</label>
			<select class="col form-select" id="selectRound" bind:value={round}>
				{#each openRounds as openRound}
					<option value={openRound}>
						{openRound.summary.name}
					</option>
				{/each}
			</select>
		</div>
		{#if competition.isMyComp || $user?.is_superuser}
			
				<label class="px-2" for="selectUser">Select Pilot:</label>
				<select class="px-2 form-select" id="selectUser" size="5" bind:value={competitor}>
					{#each openRound?.competitors || [] as competitor}
						<option value={competitor} class={competitor?.competitor.raw_score ? 'text-muted' : ''} >
              {competitor.competitor.flight_order}, {competitor.competitor.name}
						</option>
					{/each}
				</select>
			
		{/if}
	{/if}
{/if}
