<script lang="ts">
	import type { AddRule } from '$lib/competitions/compInterfaces';
	import CheckInput from '$lib/components/CheckInput.svelte';

	let {
		oldRule = $bindable(),
		newRule = $bindable(),
		disabled = $bindable()
	}: {
		oldRule: AddRule | null;
		newRule: AddRule | null;
		disabled: boolean;
	} = $props();

	function hasChanged(val1: any, val2: any) {
		return val1 != val2 ? 'bg-warning' : '';
	}

  let allowSelfAdd: boolean  = $state(false);

	let specifyRules: boolean = $state(false);

  $inspect(oldRule, specifyRules)

  $effect(() => {
    allowSelfAdd = oldRule?.cd_and_self_add || false;
    specifyRules = oldRule !== null;
  });

	$effect(() => {
		newRule = specifyRules
			? allowSelfAdd ? {cd_and_self_add: true} as AddRule : {cd_only: true} as AddRule
			: null;
	});

  

</script>

<CheckInput
	name="Specify Add Rules Here"
	bind:checked={specifyRules}
	{disabled}
	onchange={(e: Event) => {}}
  classappend={hasChanged(specifyRules, oldRule?.cd_only || oldRule?.cd_and_self_add || false)}
/>

{#if specifyRules}
	<CheckInput
		name="Allow pilots to submit their own flights"
		bind:checked={allowSelfAdd}
		classappend={hasChanged(allowSelfAdd, oldRule?.cd_and_self_add || false)}
		{disabled}
	/>
{/if}
