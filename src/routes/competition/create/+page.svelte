<script lang="ts">
	import AddRuleInput from '$lib/competitions/AddRuleInput.svelte';
  import ResultRuleInput from '$lib/competitions/ResultRuleInput.svelte';
	import TextInput from '$lib/components/TextInput.svelte';
	import { createComp } from '$lib/competitions/contests';
	import { user } from '$lib/stores/user';
	import AddCompetitor from '$lib/competitions/AddCompetitor.svelte';
	import type { CompThingSummary } from '$lib/competitions/compInterfaces';
	let { data } = $props();

  let contestSummary: CompThingSummary | undefined= $state();

	let addRule = $state({});
	let contestName = $state('');
	let comment = $state('');
	let selectedUser = $state('');
  let resultRule = $state({});
	$inspect(addRule);

	//  
</script>

<div class="row">
	<div class="col-md-6 col-sm-auto pt-3 bg-light border">
		<small>Competition Setup</small>

		<TextInput name={'Name*'} bind:value={contestName} />
		<TextInput name={'Comment'} bind:value={comment} />
		<AddRuleInput bind:rule={addRule} />
    <ResultRuleInput bind:rule={resultRule}/>
		<div class="row p-2">
			<button
				class="btn btn-outline-primary"
				disabled={contestName == ''}
				onclick={() => {
					createComp(contestName, $user!, addRule).then(res=>{contestSummary=res});
				}}
			>
				{contestSummary ? "Update" : "Create"}
			</button>
		</div>
	</div>

  {#if contestSummary}
    <div class="col-md-6 col-sm-auto pt-3 bg-light border">
      <small>Competitors</small>
      <AddCompetitor compID={contestSummary!.id} users={data.users} />
      <p>{selectedUser}</p>
    </div>
  {/if}
</div>
