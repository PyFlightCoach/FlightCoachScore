<script lang="ts">
	import type { CompetitorMeta } from '$lib/api/DBInterfaces/competition';
	import TextInput from '$lib/components/TextInput.svelte';

	let {
		oldMeta,
		newMeta = $bindable(),
		showChanges = true,
	}: {
		oldMeta: CompetitorMeta;
		newMeta: CompetitorMeta;
		showChanges?: boolean;
	} = $props();

	function hasChanged(val1: any, val2: any) {
		return val1 != val2 && showChanges ? 'bg-warning' : '';
	}

	let registration = $state(oldMeta.registration || undefined);

	$effect(() => {
		newMeta = {
			registration: registration === '' ? undefined : registration
		} as CompetitorMeta;
	});
</script>


<TextInput name="Registration" bind:value={registration} classappend={hasChanged(newMeta?.registration, oldMeta.registration)}></TextInput>
