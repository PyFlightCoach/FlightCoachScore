<script lang="ts">
	import type { CompThingCreateUpdate, ResultRule } from '$lib/competitions/compInterfaces';
	import CheckInput from '$lib/components/CheckInput.svelte';
	import TextInput from '$lib/components/TextInput.svelte';
	import { ContestManager } from '$lib/competitions/compthings/ContestManager';
	import { setComp } from '$lib/stores/contests';
	import ResultRules from '$lib/competitions/rules/ResultRules.svelte';
	import FlightRules from '$lib/competitions/rules/FlightRules.svelte';
	import AddRules from '$lib/competitions/rules/AddRules.svelte';

	let {
		thing,
		oncreated = () => {}
	}: {
		thing: ContestManager;
		oncreated?: () => void;
	} = $props();

	let formState: string | undefined = $state();

	let name: string | undefined = $state(thing.summary.name || undefined);
	let comment: string | undefined = $state(thing.summary.comment || undefined);
	let newResultRule: ResultRule | null = $state(thing.summary.result_rules);
	let newFlightRule = $state(thing.summary.flight_rules);
	let newAddRule = $state(thing.summary.add_rules);

	let hide_results: boolean | undefined = $state(thing.summary.hide_results);

	function hasChanged(val1: any, val2: any) {
		return val1 != val2 ? 'bg-warning' : '';
	}
</script>

<small
	><ul class="list-unstyled">
		<li>id={thing.summary?.id}</li>
		{#if thing.parentID}
			<li>parent_id={thing.parentID}</li>
		{/if}
		<li>whatAmI={thing.summary.what_am_i}</li>
		<li>open={thing.summary?.is_open_now}</li>
		<li>hide result={thing.summary?.hide_results}</li>
		<li>n competitors={thing.summary?.competitors?.length}</li>
		{#each thing.summary?.directors || [] as director, i}
			<li>Director{i > 0 ? i + 1 : ''}: {director.name}</li>
		{/each}
		<li>time opened={thing.summary?.date_start}</li>
		<li>time closed={thing.summary?.date_end}</li>
	</ul></small
>

<TextInput
	name="Name"
	bind:value={name}
	classappend={hasChanged(name, thing.summary?.name)}
	disabled={!thing.isMyComp}
/>
<TextInput
	name="Comment"
	bind:value={comment}
	classappend={hasChanged(comment, thing.summary?.comment)}
	disabled={!thing.isMyComp}
/>
<hr />
<ResultRules
	bind:oldRule={thing.summary.result_rules}
	bind:newRule={newResultRule}
	disabled={!thing.isMyComp}
/>
<hr />
<FlightRules
	bind:oldRule={thing.summary.flight_rules}
	bind:newRule={newFlightRule}
	disabled={!thing.isMyComp}
/>
<hr />

<AddRules
	bind:oldRule={thing.summary.add_rules}
	bind:newRule={newAddRule}
	disabled={!thing.isMyComp}
/>

<hr />

{#if thing.summary.what_am_i == 'Round'}
	<CheckInput
		name="hide results"
		bind:checked={hide_results}
		classappend={hasChanged(hide_results, thing.summary?.hide_results || false)}
		disabled={!thing.isMyComp}
	/>
{/if}

{#if thing.isMyComp}
	<div class="row p-2">
		<button
			class="col btn btn-outline-primary"
			onclick={() => {
				ContestManager.load(thing.summary.id).then(setComp);
			}}>Reset</button
		>
		<button
			class="col btn btn-outline-primary"
			onclick={() => {
				thing
					.update({
						name,
						comment,
						result_rules: newResultRule,
						add_rules: newAddRule,
						flight_rules: newFlightRule,
						hide_results
					} as CompThingCreateUpdate)
					.then((res) => {
						setComp(res);
						oncreated();
					})
					.catch((error) => {
						formState = error.response?.data?.detail || error.message;
					});
			}}
		>
			Save
		</button>
	</div>
{/if}
