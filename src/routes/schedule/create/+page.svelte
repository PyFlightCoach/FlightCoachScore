<script lang="ts">
	import { analysisServer, dbServer } from '$lib/api';
	import PlotDtw from '$lib/components/plots/PlotDTW.svelte';
	import PlotSec from '$lib/components/plots/PlotSec.svelte';
	import { ManOptionHandler, ManoeuvreHandler, library } from '$lib/schedules';
	import { loading } from '$lib/stores/shared';

	const { data } = $props();
  let form_state: string | undefined = $state();
	let olan: string | undefined = $state(
		"2% `````4,3if``ry.'22 /~~+++..''1.'n('5if,3.).,8.---~ (13,8) -```5is';3..''iBb(``````````4',2`)....1~~"
	);
	let rules: string[] = $state(data.rules);
	let rule: string = $state('IAC');
	let mans: (ManoeuvreHandler | ManOptionHandler)[] | undefined = $state();
	let activeManId: number | undefined = $state();

	let inputmode: string = $state('OLAN');

	let categories = $derived($library.unique('category_name') || []);
	let selectedCategory: string | undefined = $state();
	let schedules = $derived(
		selectedCategory
			? $library.subset({ category_name: selectedCategory }).unique('schedule_name')
			: []
	);
	let selectedSchedule: string | undefined = $state();

	$effect(() => {
		if (inputmode == 'DB') {
			if (selectedCategory) {
				rule = $library.subset({ category_name: selectedCategory }).first.rule_name;
			}
		}
	});

	const parseOlan = () => {
		$loading = true;
    form_state = 'parsing OLAN...';
		activeManId = undefined;
		analysisServer
			.post('parse_olan', { olan, rules: rule })
			.then((res) => {
				mans = res.data.map((v) => ManoeuvreHandler.parseOlan(v));
        form_state = undefined;
			})
      .catch((e) => {
        console.error(e);
        form_state = 'error parsing OLAN';
      })
			.finally(() => {
				$loading = false;
			});
	};

	const parseDB = async () => {
		if (selectedSchedule && selectedCategory) {
			$loading = true;
			const schedule = $library.subset({
				category_name: selectedCategory,
				schedule_name: selectedSchedule
			}).first;
			mans = [];
			for (const manoeuvre of schedule.manoeuvres) {
				mans.push(await ManoeuvreHandler.parseDB(manoeuvre.id));
			}
			$loading = false;
		}
	};

	const clear = () => {
		activeManId = undefined;
		mans = undefined;
	};

	const addManoeuvre = () => {
		if (!mans) {
			mans = [];
		}
		mans.push(ManoeuvreHandler.empty('new'));
		activeManId = mans.length - 1;
	};
</script>

<div class="col-md-4 bg-light border pt-3">
	<div style="position:relative; height: 100%;">
		<div
			class="px-2"
			style="overflow-x:hidden; overflow-y:auto; position: absolute; top: 0; left: 0; bottom: 0; right: 0;"
		>
			{#if !mans}
				<small>Create Sequence</small>
				<div class="row pt-2 px-2">
					<label class="col col-form-label" for="inputmode"><span>Input Mode:</span></label>
					<select class="col col-form-input form-select" id="inputmode" bind:value={inputmode}>
						<option value="OLAN">Open Aero</option>
						<option value="DB">Database</option>
						<option value="manual">Manual</option>
					</select>
				</div>

				<div class="row pt-2 px-2">
					<label class="col col-form-label" for="olanstring"><span>Select Rules:</span></label>
					<select
						class="col col-form-control form-select"
						id="rules"
						disabled={inputmode == 'DB'}
						bind:value={rule}
						onchange={clear}
					>
						{#each rules as r}
							<option value={r}>{r}</option>
						{/each}
					</select>
				</div>

				{#if inputmode == 'OLAN'}
					<div class="row pt-2 px-2">
						<label class="col-auto col-form-label" for="olanstring"
							><span>
								Enter <a href="https://openaero.net/doc/language.html" target="”_blank”">OLAN</a> string:
							</span></label
						>
						<textarea
							id="olanstring"
							class="col form-control"
							rows="5"
							bind:value={olan}
							onchange={clear}
						></textarea>
					</div>
				{/if}

				{#if inputmode == 'DB'}
					<div class="row p-2">
						<label class="col col-form-label" for="version">Category</label>
						<select class="col form-select text-center" bind:value={selectedCategory}>
							{#each categories as cat}
								<option value={cat}>{cat}</option>
							{/each}
						</select>
					</div>

					<div class="row p-2">
						<label class="col col-form-label" for="version">Schedule</label>
						<select class="col form-select text-center" bind:value={selectedSchedule}>
							{#each schedules as sch}
								<option value={sch}>{sch}</option>
							{/each}
						</select>
					</div>
				{/if}

				{#if inputmode != 'manual'}
					<div class="row pt-2">
						<div class="col"></div>
						<button
							class="col col-form-control btn btn-outline-secondary mx-2"
							onclick={() => {
								switch (inputmode) {
									case 'OLAN':
										parseOlan();
										break;
									case 'DB':
										parseDB();
										break;
								}
							}}
							>{#if inputmode == 'DB'}Load{:else}Create{/if}</button
						>
					</div>
				{/if}
			{:else}
				<div class="row pt-2">
					<button class="col col-form-input btn btn-outline-secondary mx-2" onclick={clear}
						>Clear Sequence</button
					>
				</div>
			{/if}

			<hr />
			<div class="row p-2 pt-0">
				<label class="col col-form-label" for="olanstring"><span>Manoeuvres:</span></label>
				{#if activeManId != undefined}
					<button
						class="col-auto btn btn-outline-secondary"
						onclick={() => {
							activeManId = undefined;
						}}>Clear Selection</button
					>
				{/if}

				<div class="table-responsive pt-2 text-nowrap text-center">
					<table class="table table-sm border">
						<thead>
							<tr>
								<th scope="col" class="col-1"></th>
								<th scope="col" class="col-1">#</th>
								<th scope="col" class="col-3">name</th>
								<th scope="col" class="col-4">long name</th>
								<th scope="col" class="col-1">K</th>
							</tr>
						</thead>
						<tbody>
							{#if mans}
								{#each mans as ol, i}
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
										{#if ol}
											<td class="p-0"
												><input
													type="text"
													class="form-control text-center"
													bind:value={ol.aresti.info.short_name}
												/></td
											>
											<td class="p-0"
												><input
													type="text"
													class="form-control text-center"
													bind:value={ol.aresti.info.name}
												/></td
											>
											<td class="p-0"
												><input
													type="number"
													class="form-control"
													value={ol.aresti.info.k}
													onchange={(e) => {
														ol.aresti.info.k = parseInt((e.target as HTMLInputElement).value);
													}}
												/></td
											>
										{/if}
									</tr>
									{#if activeManId === i}
										<tr>
											<td colspan="5"> WIP... </td>
										</tr>
									{/if}
								{/each}
							{/if}
							<tr>
								<td colspan="5" class="p-0"
									><button class="btn btn-outline-secondary w-100" onclick={addManoeuvre}
										>Add Manoeuvre</button
									></td
								>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</div>
<div class="col-md-8 pt-3">
	{#if mans && mans.length > 0}
		{#if activeManId === undefined}
			<div style="position:relative; height: 100%;">
				<div
					class="container-fluid px-4 d-flex flex-column"
					style="overflow-x:hidden; overflow-y:auto; position: absolute; top: 0; left: 0; bottom: 0; right: 0;"
				>
					<div class="row">
						{#each mans as ol, i}
							<div class="col-md-6 col-lg-4 border px-4">
								<div class="row text-center">
									<lead class="col-auto border">{i + 1}</lead>
									<lead class="col border">{ol.aresti.info.short_name}</lead>
									<lead class="col border text-nowrap">{ol.aresti.info.name}</lead>
									<lead class="col-auto border">{ol.aresti.info.k}</lead>
								</div>
								<div class="row" style="height:400px">
									{#if ol.template}
										<PlotDtw
											sts={ol.template.split()}
											sp={['f3a', 'IMAC'].includes(rule) ? 10 : 20}
											expand={30}
										/>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{:else if mans[activeManId].template}
			<PlotSec
				flst={mans[activeManId].template}
				expand={50}
				exclude_controls={['slider']}
				fixRange
			/>
		{/if}
	{/if}
</div>
