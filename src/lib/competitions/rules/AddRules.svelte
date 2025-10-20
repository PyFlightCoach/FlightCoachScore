<script lang="ts">
	import type { AddRule } from '$lib/api/DBInterfaces/competition';
	import CheckInput from '$lib/components/CheckInput.svelte';

	let {
		oldRule = $bindable(null),
		newRule = $bindable(),
		disabled = $bindable(false),
		showChanges = true
	}: {
		oldRule?: AddRule | null;
		newRule: AddRule | null;
		disabled?: boolean;
		showChanges?: boolean;
	} = $props();

	function hasChanged(val1: any, val2: any) {
		return val1 != val2 && showChanges ? 'bg-warning' : '';
	}

	let allowSelfAdd: boolean = $state(false);
	let allowSelfAddFlight: boolean = $state(false);

	$effect(() => {
		allowSelfAdd = oldRule?.cd_and_self_add || false;
		allowSelfAddFlight = oldRule?.cd_and_self_flight_add || false;
	});

	$effect(() => {
		newRule = {
			cd_and_self_add: allowSelfAdd,
			cd_and_self_flight_add: allowSelfAddFlight
		} as AddRule;
	});
</script>

<CheckInput
	name={`Allow pilots to enter`}
	bind:checked={allowSelfAdd}
  title="Allow any pilot to add themselves to the competition, if false Contest Directors must add pilots."
	classappend={hasChanged(allowSelfAdd, oldRule?.cd_and_self_add || false)}
	{disabled}
/>
<CheckInput
	name={`Allow pilots to link their own flights`}
	bind:checked={allowSelfAddFlight}
	classappend={hasChanged(allowSelfAddFlight, oldRule?.cd_and_self_flight_add || false)}
	{disabled}
/>
