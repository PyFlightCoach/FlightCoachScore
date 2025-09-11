<script lang="ts">
	import type { FlightRule } from '$lib/competitions/compInterfaces';
	import CheckInput from '$lib/components/CheckInput.svelte';

	let {
		oldRule,
		newRule = $bindable(),
		disabled = $bindable(false),
    showChanges = true
	}: {
		oldRule?: FlightRule | undefined;
		newRule: FlightRule | undefined;
		disabled?: boolean;
    showChanges?: boolean;
	} = $props();

	function hasChanged(val1: any, val2: any) {
		return (val1 != val2) && showChanges ? 'bg-warning' : '';
	}

	let uploadWithin: number | undefined = $state(oldRule?.upload_within_n_hours || undefined);
	let flownWhilstOpen: boolean | undefined = $state(oldRule?.flown_whilst_open || undefined);
	let uploadWhilstOpen: boolean | undefined = $state(oldRule?.upload_whilst_open || undefined);
	let finalised: boolean | undefined = $state(oldRule?.finalised || undefined);


	$effect(() => {
		newRule = {
					upload_within_n_hours: uploadWithin || null,
					flown_whilst_open: flownWhilstOpen || null,
					upload_whilst_open: uploadWhilstOpen || null,
					finalised: finalised || null
				};
	});

</script>

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
