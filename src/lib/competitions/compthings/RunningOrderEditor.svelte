<script lang="ts">
	import type { ContestManager } from '$lib/competitions/compthings/ContestManager';
	import CheckInput from '$lib/components/CheckInput.svelte';
	import NumberInput from '$lib/components/NumberInput.svelte';
	import { setComp } from '$lib/stores/contests';

	let { stage }: { stage: ContestManager | undefined } = $props();

	let continueFromPreviousStage: boolean = $state(false);
	let rotateBy: number = $state(0);
</script>

<CheckInput
	name="Continue from previous stage"
	bind:checked={continueFromPreviousStage}
	title="If True, the first round of the stage will be based from the last round of the previous stage."
/>

<NumberInput
	name="Rotate by"
	bind:value={rotateBy}
	title="The number of competitors to rotate by.  Positive shifts competitors down, negative shifts them up."
/>

<button
	class="btn btn-outline-primary w-100"
	onclick={() => {
		stage
			?.rotateFlightOrder(continueFromPreviousStage, rotateBy)
			.then(setComp)
			.catch((error) => {
				alert(
					'Error rotating flight order: ' + error.response?.data?.detail || error.message || error
				);
			});
	}}>Apply</button
>
