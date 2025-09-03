<script lang="ts">
	import type { FlightRule } from '$lib/competitions/compInterfaces';
	import CheckInput from '$lib/components/CheckInput.svelte';

	let {
		oldRule = $bindable(),
		newRule = $bindable(),
		disabled = $bindable()
	}: {
		oldRule: FlightRule | undefined;
		newRule: FlightRule | undefined;
		disabled: boolean;
	} = $props();

	function hasChanged(val1: any, val2: any) {
		return val1 != val2 ? 'bg-warning' : '';
	}

	let uploadWithin: number | null = $state(null);
	let flownWhilstOpen: boolean | null = $state(null);
	let uploadWhilstOpen: boolean | null = $state(null);
	let finalised: boolean | null = $state(null);


	let specifyRules: boolean = $state(false);

	$effect(() => {
		newRule = specifyRules
			? {
					upload_within_n_hours: uploadWithin,
					flown_whilst_open: flownWhilstOpen,
					upload_whilst_open: uploadWhilstOpen,
					finalised: finalised
				}
			: undefined;
	});

  $effect(() => {
    specifyRules=oldRule!==null;
    uploadWithin = oldRule ? oldRule.upload_within_n_hours : null;
    flownWhilstOpen = oldRule ? oldRule.flown_whilst_open : null;
    uploadWhilstOpen = oldRule ? oldRule.upload_whilst_open : null;
    finalised = oldRule ? oldRule.finalised : null;
  });
</script>

<CheckInput
	name="Specify Flight Rules Here"
	bind:checked={specifyRules}
	{disabled}
	onchange={(e: Event) => {}}
  classappend={hasChanged(specifyRules, oldRule===undefined)}
/>

{#if specifyRules}
	<CheckInput
		name="Must boot whilst round is open"
		bind:checked={flownWhilstOpen}
		classappend={hasChanged(flownWhilstOpen, oldRule?.flown_whilst_open || false)}
		{disabled}
	/>
	<CheckInput
		name="Must upload whilst round is open"
		bind:checked={uploadWhilstOpen}
		classappend={hasChanged(uploadWhilstOpen, oldRule?.upload_whilst_open || false)}
		{disabled}
	/>
	<div class="row p-2 {hasChanged(uploadWithin, oldRule?.upload_within_n_hours)}">
		<label class="col col-form-label" for="normTo">upload within (hours from boot):</label>
		<input
			class="col form-control"
			type="number"
			id="normTo"
			bind:value={uploadWithin}
			{disabled}
		/>
	</div>
{/if}
