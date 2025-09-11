<script lang="ts">
	import type { AddRule } from '$lib/competitions/compInterfaces';
	import CheckInput from '$lib/components/CheckInput.svelte';

	let {
		oldRule = $bindable(null),
		newRule = $bindable(),
		disabled = $bindable(false),
    whatAmI,
    showChanges = true
	}: {
		oldRule?: AddRule | null;
		newRule: AddRule | null;
		disabled?: boolean;
    whatAmI: 'Competition' | 'Round';
    showChanges?: boolean;
	} = $props();

	function hasChanged(val1: any, val2: any) {
		return (val1 != val2) && showChanges ? 'bg-warning' : '';
	}

  let allowSelfAdd: boolean  = $state(false);
	

  $effect(() => {
    allowSelfAdd = oldRule?.cd_and_self_add || false;
  });

	$effect(() => {
		newRule = {cd_and_self_add: allowSelfAdd} as AddRule;
	});

  

</script>

<CheckInput
  name={"Allow pilots to register and upload their own flights"}
  bind:checked={allowSelfAdd}
  classappend={hasChanged(allowSelfAdd, oldRule?.cd_and_self_add || false)}
  {disabled}
/>
