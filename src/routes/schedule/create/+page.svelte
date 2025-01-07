<script lang="ts">
	import { analysisServer } from '$lib/api';
	import { States } from '$lib/analysis/state';
  import PlotDTW from '$lib/components/plots/PlotDTW.svelte';
	import { split } from 'lodash';

	let olan: string | undefined = $state();
	let rules: string[] = ['IAC'];

	let sts: States[] | undefined = $state();

	const createManoeuvers = () => {
		analysisServer.post('parse_olan', { olan, rules }).then((res) => {
			console.log(res.data);
			sts = res.data.map((v) => States.parse(v.template));
		});
	};
</script>

<div class="col-lg-4 bg-light border pt-3">
	<div class="row pt-2">
		<label class="col-form-label" for="olanstring"
			><span>
				Enter <a href="https://openaero.net/doc/language.html" target="”_blank”">OLAN</a> string:
			</span></label
		>
		<textarea id="olanstring" class="form-control" rows="3" bind:value={olan}></textarea>
	</div>

	<div class="row pt-2">
		<label class="col col-form-label" for="olanstring"><span>Select Rules:</span></label>
		<select class="col col-form-input form-select" id="rules" bind:value={rules}>
			{#each rules as rule}
				<option value={rule}>{rule}</option>
			{/each}
		</select>
	</div>
	<div class="row p-2 justify-content-end">
		<button class="col-auto btn btn-primary" onclick={createManoeuvers}>Create Manoeuvers</button>
	</div>
</div>

<div class="col-lg-8 align-self pt-3">
  {#if sts && sts.length > 0}
    <PlotDTW sts={sts[0].split()} sp=10/>
  {/if}
</div>
