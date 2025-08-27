<script lang="ts">
	import {
		type CompThingCreateUpdate,
		type CompThingSummary
	} from '$lib/competitions/compInterfaces';
	import CheckInput from '$lib/components/CheckInput.svelte';
	import TextInput from '$lib/components/TextInput.svelte';
	import { dbServer } from '$lib/api';
  import Rounds from "./Rounds.svelte";


	let { parentID, stage = undefined }: { parentID: string; stage?: CompThingSummary | undefined } =
		$props();

	let name: string | undefined = $state();
	let comment: string | undefined = $state();
	let uploadWithin: number | undefined = $state();
	let flownWhilstOpen: boolean = $state(false);
	let uploadWhilstOpen: boolean = $state(false);
	let finalised: boolean = $state(false);

	function hasChanged(val1: any, val2: any) {
		return val1 != val2 ? 'bg-warning' : '';
	}

	function changeStage(stage: CompThingSummary | undefined) {
		name = stage?.name;
		comment = stage?.comment;
		uploadWithin = stage?.flight_rules?.upload_within_n_hours;
		flownWhilstOpen = stage?.flight_rules?.flown_whilst_open || false;
		uploadWhilstOpen = stage?.flight_rules?.upload_whilst_open || false;
		finalised = stage?.flight_rules?.finalised || false;
	}

	$effect(() => {
		changeStage(stage);
	});

	let editing: boolean = $state(!stage?.id);
</script>

{#if stage?.id}
	<div class="row px-2">
		<button
			class="col btn btn-outline-secondary"
			onclick={() => {
				editing = !editing;
			}}
		>
			Stage Management <i class="bi bi-chevron-down"></i>
		</button>
	</div>
{/if}
{#if editing}
	<TextInput name="Name" bind:value={name} />
	<TextInput name="Comment" bind:value={comment} />
	<CheckInput
		name="Must boot whilst round is open"
		bind:checked={flownWhilstOpen}
		classappend={hasChanged(name, stage?.name)}
	/>
	<CheckInput name="Must upload whilst round is open" bind:checked={uploadWhilstOpen} />
	<div class="row p-2">
		<label class="col col-form-label" for="normTo">upload within (hours):</label>
		<input class="col form-control" type="number" id="normTo" bind:value={uploadWithin} />
	</div>

	<CheckInput name="finalised" bind:checked={finalised} />

	<div class="row px-2">
		{#if stage?.id}
			<button
				class="col btn btn-outline-primary"
				onclick={() => {
					// Handle delete logic here
				}}
			>
				Delete
			</button>
		{/if}
		<button
			class="col btn btn-outline-primary"
			onclick={() => {
				dbServer
					.post('competition', {
						name,
						comment,
						parent_id: parentID,
						flight_rules: {
							upload_within_n_hours: uploadWithin,
							flown_whilst_open: flownWhilstOpen,
							upload_whilst_open: uploadWhilstOpen,
							finalised
						}
					} as CompThingCreateUpdate)
					.then((res) => {
						// Handle successful save
					})
					.catch((error) => {
						// Handle error
					});
			}}
		>
			{stage?.id ? 'update' : 'create'}
		</button>
	</div>
{/if}

<Rounds parentID={parentID} rounds={stage?.children} />