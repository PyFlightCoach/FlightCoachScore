<script lang="ts">
	import type { FlightRule } from '$lib/api/DBInterfaces/competition';
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
	let uploadOnlyOnce: boolean | undefined = $state(oldRule?.upload_only_once || undefined);
  let finalised: boolean | undefined = $state(oldRule?.finalised || undefined);


	$effect(() => {
		newRule = {
					upload_within_n_hours: uploadWithin || null,
					flown_whilst_open: flownWhilstOpen || null,
					upload_whilst_open: uploadWhilstOpen || null,
          upload_only_once: uploadOnlyOnce || null,
					finalised: finalised || null
				};
	});

</script>

<CheckInput
  name="Must boot whilst round is open"
  bind:checked={flownWhilstOpen}
  title="The flight must be flown whilst the round is open."
  classappend={hasChanged(flownWhilstOpen, oldRule?.flown_whilst_open || false)}
  {disabled}
/>
<CheckInput
  name="Must upload whilst round is open"
  bind:checked={uploadWhilstOpen}
  title="The flight must be uploaded and assigned whilst the round is open."
  classappend={hasChanged(uploadWhilstOpen, oldRule?.upload_whilst_open || false)}
  {disabled}
/>
<div class="row mb-2 {hasChanged(uploadWithin, oldRule?.upload_within_n_hours)}"
title="The flight must be uploaded and assigned within n hours of being flown.">
  <label class="col col-form-label" for="normTo">upload within (hours from boot):</label>
  <input
    class="col form-control"
    type="number"
    id="normTo"
    bind:value={uploadWithin}
    {disabled}
  />
</div>
<CheckInput
  name="Prevent flight overwrite"
  title="Only a CD can overwrite a flight already assigned to a round."
  bind:checked={uploadOnlyOnce}
  classappend={hasChanged(uploadOnlyOnce, oldRule?.upload_only_once || false)}
  {disabled}
/>