<script lang="ts">
	import { type AddRule } from './compInterfaces';
	import CheckInput from '$lib/components/CheckInput.svelte';
	let { rule = $bindable<AddRule>() }: { rule: AddRule } = $props();

	let pilotAdd: boolean = $state(false);

	$effect(() => {
    if (pilotAdd) {
      rule = {cd_and_self_add: true} as AddRule;
    } else {
      rule = {cd_only: true} as AddRule;
    }
	});
</script>

<CheckInput name="Allow pilots to submit their own flights" bind:checked={pilotAdd} />
