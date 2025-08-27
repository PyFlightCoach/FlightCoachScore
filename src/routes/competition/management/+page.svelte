<script lang="ts">
	import ResultRuleInput from '$lib/competitions/ResultRuleInput.svelte';
	import TextInput from '$lib/components/TextInput.svelte';
	import CheckInput from '$lib/components/CheckInput.svelte';
	import { activeComp, updateCDComps } from '$lib/stores/contests';
	import { user, type DBUser } from '$lib/stores/user';
	import Stages from '$lib/competitions/Stages.svelte';
	import type {
		CompThingSummary,
		CompThingCreateUpdate,
		ResultRule,
    Competitor
	} from '$lib/competitions/compInterfaces';
  import CompetitorTable from '$lib/competitions/CompetitorTable.svelte';
	import { dbServer } from '$lib/api';
  

	let { data }: { data: { users: DBUser[]; } } = $props();

	let compnormalisation = $derived(
		$activeComp.result_rules?.raw_score
			? 'raw'
			: $activeComp.result_rules?.normalise_average_to_n
				? 'average'
				: 'best'
	);

	let name: string = $state('');
	let comment: string | undefined = $state();
	let allowSelfAdd: boolean = $state(false);
	let result_rules: ResultRule | undefined = $state();
	let normalisation: string = $state('raw');
	let normalise_to: number | undefined = $state(1000);
	let hide_results: boolean = $state(false);
  let competitors: Competitor[] = $state([]);

  function hasChanged(val1: any, val2: any) {
		return val1 != val2 ? 'bg-warning' : '';
	}

	function changeComp(comp: CompThingSummary) {
		name = comp.name;
		comment = comp.comment;
		result_rules = comp.result_rules;
		allowSelfAdd = comp.add_rules?.cd_and_self_add || false;
		normalisation = compnormalisation;
		normalise_to =
			comp.result_rules?.normalise_best_to_n || comp.result_rules?.normalise_average_to_n || 1000;
		hide_results = comp.hide_results;
    competitors = comp.competitors!;
	}

	$effect(() => {
		changeComp($activeComp);
	});

	function createUpdateRequest() {
		return {
			name,
			comment,
			fa_version: $activeComp.fa_version,
			//      directors: $activeComp.directors?.map(d=>d.id),
			result_rules: {
				normalise_best_to_n: normalisation === 'best' ? normalise_to : undefined,
				normalise_average_to_n: normalisation === 'average' ? normalise_to : undefined,
				raw_score: normalisation === 'raw'
			},
			add_rules: {
				cd_only: !allowSelfAdd,
				cd_and_self_add: allowSelfAdd
			},
			hide_results
		} as CompThingCreateUpdate;
	}
</script>

<div class="row">
	<div class="col-md-4 col-sm-6 pt-3 bg-light border">
		<small>Competition Setup</small>

		<TextInput
			name={'Name*'}
			bind:value={name}
			classappend={hasChanged(name, $activeComp.name)}
		/>
		<TextInput
			name={'Comment'}
			bind:value={comment}
			classappend={hasChanged(comment, $activeComp.comment)}
		/>
		<CheckInput
			name="Allow pilots to submit their own flights"
			bind:checked={allowSelfAdd}
			classappend={hasChanged(allowSelfAdd, $activeComp.add_rules?.cd_and_self_add || false)}
		/>

		<div class="row p-2 {hasChanged(normalisation, compnormalisation)}">
			<label class="col col-form-label" for="normOption">Normalisation:</label>
			<select class="col col-form-input form-select" id="normOption" bind:value={normalisation}>
				<option value="raw">Raw Score</option>
				<option value="best">Best Score</option>
				<option value="average">Average Score</option>
			</select>
		</div>
		{#if normalisation != 'raw'}
			<div class="row p-2">
				<label class="col col-form-label" for="normTo">Normalise to:</label>
				<input class="col form-control" type="number" id="normTo" bind:value={normalise_to} />
			</div>
		{/if}
		<div class="row p-2">
			{#if $activeComp.id}<button
					class="col mx-2 btn btn-outline-primary"
					onclick={() => {
						if (confirm('Are you sure you want to delete this competition?')) {
							dbServer.delete(`competition/${$activeComp.id}`);
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
					if (!$activeComp.id) {
						dbServer.post('competition', createUpdateRequest()).then((res) => {
							updateCDComps();
              $activeComp = res.data;
						});
					} else {
						dbServer
							.patch(`competition/${$activeComp.id}`, createUpdateRequest())
							.then((res) => {
								$activeComp = res.data;
							});
					}
				}}
			>
				{$activeComp.id ? 'Update' : 'Create'}
			</button>
		</div>
	</div>

	{#if $activeComp.id}
		<div class="col-md-4 col-sm-3 pt-3 bg-light border">
			<CompetitorTable users={data.users} {competitors} />
      
		</div>
	{/if}
  <div class="col-md-4  col-sm-3 pt-3 bg-light border">
    <Stages parentID={$activeComp.id} bind:stages={$activeComp.children } />
  </div>
</div>


