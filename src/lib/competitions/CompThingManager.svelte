<script lang="ts">
	import type {
		CompThingCreateUpdate,
		CompThingSummary,
		Competition,
		Stage,
		Round,
		Thing,
		Competitor
	} from '$lib/competitions/compInterfaces';
	import CheckInput from '$lib/components/CheckInput.svelte';
	import TextInput from '$lib/components/TextInput.svelte';
	import { dbServer } from '$lib/api';
	import CompThings from './CompThings.svelte';
	import { faVersion } from '$lib/stores/shared';
	import { activeComp, updateCDComps } from '$lib/stores/contests';
	import CompetitorTable from './CompetitorTable.svelte';

	let {
		parentID,
		whatAmI,
		thing
	}: {
		parentID?: string | undefined;
		whatAmI: Thing;
		thing?: CompThingSummary | undefined;
	} = $props();

	let name: string | undefined = $state();
	let comment: string | undefined = $state();
	let allowSelfAdd: boolean = $state(false);
	let normalisation: string = $state('raw');
	let normalise_to: number | undefined = $state(1000);
	let progressTopN: number | undefined = $state();
	let hide_results: boolean = $state(false);
	let competitors: Competitor[] = $state([]);
	let uploadWithin: number | undefined = $state();
	let flownWhilstOpen: boolean = $state(false);
	let uploadWhilstOpen: boolean = $state(false);
	let finalised: boolean = $state(false);

	function hasChanged(val1: any, val2: any) {
		return val1 != val2 ? 'bg-warning' : '';
	}

	let compnormalisation = $derived(
		thing?.result_rules?.raw_score
			? 'raw'
			: thing?.result_rules?.normalise_average_to_n
				? 'average'
				: 'best'
	);

	function changeThing(_thing: CompThingSummary | undefined) {
		name = _thing?.name;
		comment = _thing?.comment;
		allowSelfAdd = _thing?.add_rules?.cd_and_self_add || false;
		normalisation = compnormalisation;
		normalise_to =
			_thing?.result_rules?.normalise_best_to_n ||
			_thing?.result_rules?.normalise_average_to_n ||
			1000;
		progressTopN = _thing?.result_rules?.progress_top_n;
		hide_results = _thing?.hide_results || false;
		competitors = _thing?.competitors!;
		uploadWithin = _thing?.flight_rules?.upload_within_n_hours;
		flownWhilstOpen = _thing?.flight_rules?.flown_whilst_open || false;
		uploadWhilstOpen = _thing?.flight_rules?.upload_whilst_open || false;
		finalised = _thing?.flight_rules?.finalised || false;
	}

	function createUpdateRequest() {
		let data = {
			name,
			comment,
			fa_version: $faVersion,
			result_rules: {
				normalise_best_to_n: normalisation === 'best' ? normalise_to : undefined,
				normalise_average_to_n: normalisation === 'average' ? normalise_to : undefined,
				raw_score: normalisation === 'raw'
			},
			hide_results
		} as CompThingCreateUpdate;

		if (whatAmI == 'competition' || whatAmI == 'stage') {
			data.add_rules = {
				cd_only: !allowSelfAdd,
				cd_and_self_add: allowSelfAdd
			};
		}

		if (whatAmI == 'stage') {
			data.flight_rules = {
				upload_within_n_hours: uploadWithin,
				flown_whilst_open: flownWhilstOpen,
				upload_whilst_open: uploadWhilstOpen,
				finalised: finalised
			};
		}

		return data;
	}

	$effect(() => {
		changeThing(thing);
	});

	let editing: boolean = $state(whatAmI == 'competition' ? true : !thing?.id);
</script>

<div class="col">
	{#if thing?.id}
		<div class="row px-2">
			<button
				class="col btn btn-outline-secondary"
				onclick={() => {
					editing = !editing;
				}}
			>
				Manage {whatAmI} <i class="bi bi-chevron-down"></i>
			</button>
		</div>
	{/if}

	{#if editing}
		<TextInput name="Name" bind:value={name} classappend={hasChanged(name, thing?.name)} />
		<TextInput
			name="Comment"
			bind:value={comment}
			classappend={hasChanged(comment, thing?.comment)}
		/>
		<hr />
		<small>Result Rules</small>

		<div class="row p-2 {hasChanged(normalisation, compnormalisation)}">
			<label class="col col-form-label" for="normOption">Normalisation:</label>
			<select class="col col-form-input form-select" id="normOption" bind:value={normalisation}>
				<option value="raw">Raw Score</option>
				<option value="best">Best Score</option>
				<option value="average">Average Score</option>
			</select>
		</div>
		{#if normalisation != 'raw'}
			<div
				class="row p-2 {hasChanged(normalise_to, thing?.result_rules?.normalise_best_to_n || 1000)}"
			>
				<label class="col col-form-label" for="normTo">Normalise to:</label>
				<input class="col form-control" type="number" id="normTo" bind:value={normalise_to} />
			</div>
		{/if}
		<div class="row p-2 {hasChanged(progressTopN, thing?.result_rules?.progress_top_n)}">
			<label class="col col-form-label" for="progressTopN">Progress top n:</label>
			<input class="col form-control" type="number" id="progressTopN" bind:value={progressTopN} />
		</div>

		{#if whatAmI == 'competition' || whatAmI == 'stage'}
			<hr />
			<small>Add Rules</small>

			<CheckInput
				name="Allow pilots to submit their own flights"
				bind:checked={allowSelfAdd}
				classappend={hasChanged(allowSelfAdd, thing?.add_rules?.cd_and_self_add || false)}
			/>
		{/if}
		{#if whatAmI == 'stage'}
			<hr />
			<small>Flight Rules</small>

			<CheckInput
				name="Must boot whilst round is open"
				bind:checked={flownWhilstOpen}
				classappend={hasChanged(flownWhilstOpen, thing?.flight_rules?.flown_whilst_open || false)}
			/>
			<CheckInput
				name="Must upload whilst round is open"
				bind:checked={uploadWhilstOpen}
				classappend={hasChanged(uploadWhilstOpen, thing?.flight_rules?.upload_whilst_open || false)}
			/>
			<div class="row p-2 {hasChanged(uploadWithin, thing?.flight_rules?.upload_within_n_hours)}">
				<label class="col col-form-label" for="normTo">upload within (hours from boot):</label>
				<input class="col form-control" type="number" id="normTo" bind:value={uploadWithin} />
			</div>
		{/if}

		<CheckInput
			name="finalised"
			bind:checked={finalised}
			classappend={hasChanged(finalised, thing?.flight_rules?.finalised || false)}
		/>

		<div class="row p-2">
			{#if thing}<button
					class="col mx-2 btn btn-outline-primary"
					onclick={() => {
						if (confirm('Are you sure you want to delete this competition?')) {
							dbServer.delete(`competition/${thing}`);
						}
					}}>Delete</button
				>{/if}
			<button
				class="col btn btn-outline-primary"
				onclick={() => {
					dbServer.get(`competition/${$activeComp.id}`).then((res) => {
						$activeComp = res.data;
					});
				}}>Reset</button
			>
			<button
				class="col btn btn-outline-primary"
				onclick={() => {
					if (!thing) {
						dbServer.post('competition', createUpdateRequest()).then((res) => {
							updateCDComps();
							$activeComp = res.data;
						});
					} else {
						dbServer.patch(`competition/${thing}`, createUpdateRequest()).then((res) => {
							$activeComp = res.data;
						});
					}
				}}
			>
				{thing ? 'Update' : 'Create'}
			</button>
		</div>
	{/if}
</div>

{#if thing?.id}
	{#if whatAmI == 'competition'}
		<div class="col">
			<CompetitorTable {competitors} />
		</div>
	{/if}

	<div class="col">
		{#if whatAmI == 'competition' || whatAmI == 'stage'}
			<CompThings
				{parentID}
				things={thing?.children}
				whatAreThey={whatAmI == 'competition' ? 'stage' : 'round'}
			/>
		{/if}
	</div>
{/if}
