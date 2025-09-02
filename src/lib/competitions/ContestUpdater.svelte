<script lang="ts">
	import type {
		CompThingCreateUpdate,
		CompThingSummary,
		Thing,
	} from '$lib/competitions/compInterfaces';
	import CheckInput from '$lib/components/CheckInput.svelte';
	import TextInput from '$lib/components/TextInput.svelte';
	import { dbServer } from '$lib/api';
	import {ContestManager} from '$lib/competitions/ContestManager';
	import { activeComp, setComp } from '$lib/stores/contests';
	import { set } from 'lodash';
	
	let {
		thing,
		oncreated = () => {}
	}: {
		thing: ContestManager;
		oncreated?: () => void;
	} = $props();

	let name: string | undefined = $state(thing.summary.name);
	let comment: string | undefined = $state(thing.summary.comment);
	let allowSelfAdd: boolean = $state(thing.summary.add_rules?.cd_and_self_add || false);

	let compnormalisation = thing.summary.result_rules?.raw_score
		? 'raw'
		: thing.summary.result_rules?.normalise_average_to_n
		? 'average'
		: 'best';

	let normalisation: string = $state(compnormalisation);
	let normalise_to: number | undefined = $state(thing.summary.result_rules?.normalise_best_to_n || thing.summary.result_rules?.normalise_average_to_n || 1000);
	let progressTopN: number | undefined = $state(thing.summary.result_rules?.progress_top_n);
	let hide_results: boolean = $state(thing.summary.hide_results || false);
	let uploadWithin: number | undefined = $state(thing.summary.flight_rules?.upload_within_n_hours);
	let flownWhilstOpen: boolean = $state(thing.summary.flight_rules?.flown_whilst_open || false);
	let uploadWhilstOpen: boolean = $state(thing.summary.flight_rules?.upload_whilst_open || false);
	let finalised: boolean = $state(thing.summary.flight_rules?.finalised || false);

	function hasChanged(val1: any, val2: any) {
		return val1 != val2 ? 'bg-warning' : '';
	}

	function createUpdateRequest() {
		let data = {
			name,
			comment,
			result_rules: {
				normalise_best_to_n: normalisation === 'best' ? normalise_to : undefined,
				normalise_average_to_n: normalisation === 'average' ? normalise_to : undefined,
				raw_score: normalisation === 'raw'
			},
			hide_results
		} as CompThingCreateUpdate;

		if (thing.summary.what_am_i == 'Competition' || thing.summary.what_am_i == 'Stage') {
			data.add_rules = {
				cd_only: !allowSelfAdd,
				cd_and_self_add: allowSelfAdd
			};
		}

		if (thing.summary.what_am_i == 'Stage') {
			data.flight_rules = {
				upload_within_n_hours: uploadWithin,
				flown_whilst_open: flownWhilstOpen,
				upload_whilst_open: uploadWhilstOpen,
				finalised: finalised
			};
		}

		return data;
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
      <li>Director{i>0 ? i+1 : ""}: {director.name}</li>
    {/each}
	</ul></small
>

<TextInput name="Name" bind:value={name} classappend={hasChanged(name, thing.summary?.name)} disabled={!thing.isMyComp}/>
<TextInput name="Comment" bind:value={comment} classappend={hasChanged(comment, thing.summary?.comment)} disabled={!thing.isMyComp}/>
<hr />
<small>Result Rules</small>

<div class="row p-2 {hasChanged(normalisation, compnormalisation)}">
	<label class="col col-form-label" for="normOption">Normalisation:</label>
	<select class="col col-form-input form-select" id="normOption" bind:value={normalisation} disabled={!thing.isMyComp}>
		<option value="raw">Raw Score</option>
		<option value="best">Best Score</option>
		<option value="average">Average Score</option>
	</select>
</div>
{#if normalisation != 'raw'}
	<div class="row p-2 {hasChanged(normalise_to, thing.summary?.result_rules?.normalise_best_to_n || 1000)}">
		<label class="col col-form-label" for="normTo">Normalise to:</label>
		<input class="col form-control" type="number" id="normTo" bind:value={normalise_to} disabled={!thing.isMyComp}/>
	</div>
{/if}
<div class="row p-2 {hasChanged(progressTopN, thing.summary?.result_rules?.progress_top_n)}">
	<label class="col col-form-label" for="progressTopN">Progress top n:</label>
	<input class="col form-control" type="number" id="progressTopN" bind:value={progressTopN} disabled={!thing.isMyComp}/>
</div>

{#if thing.summary.what_am_i == 'Competition' || thing.summary.what_am_i == 'Stage'}
	<hr />
	<small>Add Rules</small>

	<CheckInput
		name="Allow pilots to submit their own flights"
		bind:checked={allowSelfAdd}
		classappend={hasChanged(allowSelfAdd, thing.summary?.add_rules?.cd_and_self_add || false)}
    disabled={!thing.isMyComp}
	/>
{/if}
{#if thing.summary.what_am_i == 'Stage'}
	<hr />
	<small>Flight Rules</small>

	<CheckInput
		name="Must boot whilst round is open"
		bind:checked={flownWhilstOpen}
		classappend={hasChanged(flownWhilstOpen, thing.summary?.flight_rules?.flown_whilst_open || false)}
    disabled={!thing.isMyComp}
	/>
	<CheckInput
		name="Must upload whilst round is open"
		bind:checked={uploadWhilstOpen}
		classappend={hasChanged(uploadWhilstOpen, thing.summary?.flight_rules?.upload_whilst_open || false)}
    disabled={!thing.isMyComp}
	/>
	<div class="row p-2 {hasChanged(uploadWithin, thing.summary?.flight_rules?.upload_within_n_hours)}">
		<label class="col col-form-label" for="normTo">upload within (hours from boot):</label>
		<input class="col form-control" type="number" id="normTo" bind:value={uploadWithin} disabled={!thing.isMyComp}/>
	</div>
{/if}
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
      ContestManager.load(thing.summary.id)
      .then(setComp);
		}}>Reset</button
	>
	<button
		class="col btn btn-outline-primary"
		onclick={() => {
      thing.update(createUpdateRequest())
      .then(setComp);
		}}
	>
		Save
	</button>
</div>
{/if}