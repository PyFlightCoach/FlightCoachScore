<script lang="ts">
	import { analysisServer } from '$lib/api';
	import PlotSec from '$lib/components/plots/PlotSec.svelte';
	import { Olan } from '$lib/schedules';

  const {data} = $props();

	let olan: string | undefined = $state(
		"2% `````4,3if``ry.'22 /~~+++..''1.'n('5if,3.).,8.---~ (13,8) -```5is';3..''iBb(``````````4',2`)....1~~"
	);
	let rules: string[] = $state(data.rules);
	let rule: string = 'IAC';

	let olandata: Record<string, any>[] | undefined = $state();

	let activeManId: number | undefined = $state(0);

	const createManoeuvers = () => {
		activeManId = undefined;
		analysisServer.post('parse_olan', { olan, rules: rule }).then((res) => {
			olandata = res.data.map((v) => Olan.parse(v));
		});
	};

	const clear = () => {
		activeManId = undefined;
		olandata = undefined;
	};
</script>

<div class="col-md-4 bg-light border pt-3">
	<div class="row pt-2 px-2">
		<label class="col-auto col-form-label" for="olanstring"
			><span>
				Enter <a href="https://openaero.net/doc/language.html" target="”_blank”">OLAN</a> string:
			</span></label
		>
		<textarea id="olanstring" class="col form-control" rows="5" bind:value={olan} onchange={clear}
		></textarea>
	</div>

	<div class="row pt-2 px-2">
		<label class="col col-form-label" for="olanstring"><span>Select Rules:</span></label>
		<select class="col col-form-input form-select" id="rules" bind:value={rule} oninput={clear}>
			{#each rules as r}
				<option value={r}>{r}</option>
			{/each}
		</select>
		{#if !olandata}
			<button class="col col-form-input btn btn-primary" onclick={createManoeuvers}>Create</button>
		{:else}
			<button class="col col-form-input btn btn-primary" onclick={clear}>Clear</button>
		{/if}
	</div>

	{#if olandata}
		<div class="row p-2">
			<label class="col col-form-label" for="olanstring"><span>Select Manoeuvre:</span></label>
			{#if activeManId != undefined}
				<button
					class="col-auto btn btn-outline-secondary"
					onclick={() => {
						activeManId = undefined;
					}}>Clear Selection</button
				>
			{/if}

			<div class="table-responsive pt-2">
				<table class="table table-sm border">
					<thead>
						<tr>
							<th></th>
							<th scope="col">#</th>
							<th scope="col">name</th>
							<th scope="col">long name</th>
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
									<td>{i + 1}</td>
									<td>{ol.aresti.info.short_name}</td>
									<td>{ol.aresti.info.name}</td>
									<td>{ol.olan.rawfig}</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

<div class="col-md-8 pt-3">
	{#if olandata && olandata.length > 0}
		{#if activeManId===undefined}
			<div class="container-fluid">
				<div class="row">
					{#each olandata as ol, i}
						<div class="col-md-6 col-lg-4 border">
							<div class="row text-center">
								<lead class="col">{i + 1}</lead>
								<lead class="col">{ol.rawfig}</lead>
							</div>
							<div class="row" style="height:400px">
								<PlotSec flst={ol.template} scale={2} expand={50} controls={['play']} />
							</div>
						</div>
					{/each}
				</div>
			</div>
		{:else}
			<PlotSec flst={olandata[activeManId].template} expand={50} exclude_controls={["slider"]} fixRange/>
		{/if}
	{/if}
</div>
