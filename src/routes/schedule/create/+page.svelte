<script lang="ts">
	import { analysisServer } from '$lib/api';
	import { States } from '$lib/analysis/state';
	import PlotDTW from '$lib/components/plots/PlotDTW.svelte';
	import { Olan } from '$lib/schedules';

	let olan: string | undefined = $state(
		"2% `````4,3if``ry.'22 /~~+++..''1.'n('5if,3.).,8.---~ (13,8) -```5is';3..''iBb(``````````4',2`)....1~~"
	);
	let rules: string[] = ['IAC'];
	let rule: string = 'IAC';

	let olandata: Record<string, any>[] | undefined = $state();

	let activeManId: number | undefined = $state(0);

	const createManoeuvers = () => {
		analysisServer.post('parse_olan', { olan, rules: rule }).then((res) => {
			olandata = res.data.map((v) => Olan.parse(v));
			//sts = res.data.map((v) => States.parse(v.template));
		});
	};
</script>

<div class="col-lg-5 bg-light border pt-3">
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
		<select class="col col-form-input form-select" id="rules" bind:value={rule}>
			{#each rules as r}
				<option value={r}>{r}</option>
			{/each}
		</select>
	</div>
	<div class="row p-2 justify-content-end">
		<button class="col-auto btn btn-primary" onclick={createManoeuvers}>Create Manoeuvers</button>
	</div>
	<div class="row p-2">
		<label class="col col-form-label" for="olanstring"><span>Select Manoeuvre:</span></label>
		{#if activeManId != undefined && olandata}
			<button
				class="col-auto btn btn-outline-secondary"
				onclick={() => {
					activeManId = undefined;
				}}>Clear Selection</button
			>
		{/if}

		<div class="table-responsive">
			<table class="table table-sm">
				<thead>
					<tr>
						<th></th>
						<th scope="col">chars</th>
						<th scope="col">Draw</th>
						<th scope="col">Fig</th>
					</tr>
				</thead>
				<tbody>
					{#if olandata}
						{#each olandata as ol, i}
							<tr>
								<td
									><input
										class="radio"
										type="radio"
										name="manSelect"
										bind:group={activeManId}
										value={i}
									/></td
								>
								<td>{ol.figure.chars}</td>
								<td>{ol.draw}</td>
								<td>{ol.rawfig}</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

<div class="col-lg-7 align-self pt-3">
	{#if olandata && olandata.length > 0}
		{#if activeManId != undefined}
			<PlotDTW sts={olandata[activeManId].template.split()} sp={10} />
		{:else}
			<PlotDTW
				sts={Object.fromEntries(olandata.map((ol, i) => [i, ol.template]))}
				sp={10}
				bind:activeEl={activeManId}
			/>
		{/if}
	{/if}
</div>
