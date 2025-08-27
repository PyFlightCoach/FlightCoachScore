<script lang="ts">
	import {
		type CompThingCreateUpdate,
		type CompThingSummary
	} from '$lib/competitions/compInterfaces';
	import CheckInput from '$lib/components/CheckInput.svelte';
	import TextInput from '$lib/components/TextInput.svelte';
	import { dbServer } from '$lib/api';
	import Rounds from './Rounds.svelte';

	let { parentID, round = undefined }: { parentID: string; round?: CompThingSummary | undefined } =
		$props();

	let name: string | undefined = $state();
	let comment: string | undefined = $state();

	function hasChanged(val1: any, val2: any) {
		return val1 != val2 ? 'bg-warning' : '';
	}

	function update(stage: CompThingSummary | undefined) {
		name = stage?.name;
		comment = stage?.comment;
	}

	$effect(() => {
		update(round);
	});

	let editing: boolean = $state(!round?.id);
</script>

<div class="col">
	{#if round?.id}
		<div class="row px-2">
			<button
				class="col btn btn-outline-secondary"
				onclick={() => {
					editing = !editing;
				}}
			>
				Round Management <i class="bi bi-chevron-down"></i>
			</button>
		</div>
	{/if}
	{#if editing}
		<TextInput name="Name" bind:value={name} />
		<TextInput name="Comment" bind:value={comment} />
		<div class="row px-2">
			{#if round?.id}
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
							parent_id: parentID
						} as CompThingCreateUpdate)
						.then((res) => {
							// Handle successful save
						})
						.catch((error) => {
							// Handle error
						});
				}}
			>
				{round?.id ? 'update' : 'create'}
			</button>
		</div>
	{/if}
</div>
