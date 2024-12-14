<script lang="ts">
	import PlotSec from '$lib/components/plots/PlotSec.svelte';
	import { ManSplit, parseFCJMans, Splitting } from '$lib/analysis/splitting.svelte';
	import { newAnalysis } from '$lib/analysis/analysis';
	import { isCompFlight, states, fcj, bin } from '$lib/stores/analysis';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { FCJson } from '$lib/analysis/fcjson';
	import { loadManDef, library, loadKnowns } from '$lib/schedules';
	import ManSelect from '$lib/components/manselect/ManSelect.svelte';
	

	loadKnowns();

	let mans: ManSplit[] = $state([ManSplit.TakeOff()]);
	let activeManId: number = $state(0);

	let activeIndex: number = $state(0);
  let lastStop = $derived(activeManId == 0 ? 0 : mans[activeManId - 1].stop!);

  let lastAllowedIndex = $derived(
    activeManId == mans.length - 1
      ? $states!.data.length
      : mans[activeManId + 1].stop || $states!.data.length
  );


  $inspect(mans[activeManId]);

	let range: [number, number] = $state([0, Math.min($states!.data.length, 3000)]);
	$effect(() => {
		range = [lastStop, lastAllowedIndex];
	});


	const parseFCJ = (file: File) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			$fcj = FCJson.parse(JSON.parse(e.target?.result as string));

			activeManId = 0;
			mans = [ManSplit.TakeOff()];
			parseFCJMans($fcj!, $states!).then((res) => {
				mans = res;
				activeManId = 1;
			});
		};
		reader.readAsText(file);
	};

	const addMan = () => {
		mans = [...mans, mans[activeManId].next($states?.data.length)];
		activeManId = mans.length - 1;
	};


	const setRange = () => {
    console.log('setting range of:', activeManId, ' to:', activeIndex);
    mans[activeManId].stop = activeIndex;
	};
</script>

<svelte:window
	onkeydown={(e) => {
		switch (e.key) {
			case 'Enter':
				if (activeManId == mans.length - 1) {
					if (!mans[activeManId].stop) {
						setRange();
					} else if (mans[mans.length - 1].name) {
						addMan();
					}
				}
				break;
		}
	}}
/>

<div class="col-3 pt-2">
  <p>{mans[activeManId].stop || 'undefined'}</p>
	<div class="container bg-light border pt-2">
		{#if $bin || $fcj}
			<span>Source File: {$bin?.name || $fcj?.name || 'unknown'}</span>
		{/if}
		{#if mans.length == 1}
			<div class="row mb-2">
				<label for="load-fcj" class="col-8 col-form-label">Load FC Json File:</label>
				<div id="load-fcj" class="col-4">
					<label class="btn btn-outline-secondary">
						<input
							type="file"
							name="input-name"
							style="display: none;"
							accept=" .json"
							onchange={(e: Event) => {
								if (e.target?.files?.length > 0) {
									parseFCJ(e.target.files[0]);
								}
							}}
						/>
						<span>Parse FCJ</span>
					</label>
				</div>
			</div>
		{:else}
			<div class="row">
				<label for="clear-splitting" class="col-8">Clear Manoeuvres:</label>
				<button
					id="clear-splitting"
					class="btn btn-outline-secondary form-control-sm col-4"
					onclick={() => {
						$fcj = undefined;
						activeManId = 0;
						mans = [ManSplit.TakeOff()];
					}}
				>
					Clear
				</button>
			</div>
		{/if}
	</div>

	<div class="container bg-light border">
		<small>Manoeuvres</small>
		<table class="table-sm table-bordered align-middle container-fluid text-center">
			<thead>
				<tr>
					<th scope="col" class="col-1"></th>
					<th scope="col" class="col-2">Manoeuvre</th>
					<th colspan="2" scope="col" class="col-7">Action</th>
				</tr>
			</thead>
			<tbody>
				{#each mans as man, i}
					<tr>
						<td
							><input
								class="radio"
								type="radio"
								name="manSelect"
								value={i}
								bind:group={activeManId}
							/></td
						>

						{#if man.fixed || activeManId != i}
							<td>{man.name}</td>
						{:else if activeManId == i}
							<td>
								<ManSelect
									library={$library}
									old_man={man}
									onselected={(nms: ManSplit) => {
										Object.assign(mans[i], nms);
									}}
								/>
							</td>
						{/if}
						{#if activeManId == i}
							{#if mans[activeManId].alternate_name != 'Landing'}
								<td
									role="button"
									data-bs-toggle="tooltip"
									title="Set the end point of this manoeuvre to the point identified by the little plane"
									onclick={() => { mans[activeManId].stop = activeIndex; console.log('setting stop to:', activeIndex); }}
								>
									Set{mans[activeManId].stop ? '' : ' (⏎)'}
								</td>
							{/if}
							{#if !man.fixed}
								<td
									role="button"
									data-bs-toggle="tooltip"
									title="Delete this manoeuvre"
									onclick={() => {
										activeManId = activeManId - 1;
										mans.splice(activeManId + 1, 1);
									}}>Delete</td
								>
							{/if}
						{:else}
							<td colspan="3"></td>
						{/if}
					</tr>
				{/each}
				{#if (mans[mans.length - 1].manoeuvre || mans[mans.length - 1].alternate_name) && mans[mans.length - 1].alternate_name != 'Landing'}
					{#if mans[mans.length - 1].stop}
						<tr>
							<td colspan="6" role="button" onclick={addMan}
								>Add{mans[activeManId].stop && (mans[activeManId].manoeuvre || mans[activeManId].alternate_name)
									? '(⏎)'
									: ''}</td
							>
						</tr>
					{/if}
				{/if}
			</tbody>
		</table>
	</div>
	{#if mans[mans.length - 1].name == 'Landing'}
		<div class="container bg-light border">
			<div class="row">
				<button
					class="btn btn-outline-primary form-control-sm"
					onclick={() => {
						newAnalysis($states!, new Splitting(mans));
						goto(base + '/flight/results');
					}}
				>
					Complete
				</button>
			</div>
		</div>
	{/if}
</div>

<div class="col-9">
	{#if $states}
		<PlotSec
			bind:i={activeIndex}
			bind:range
			flst={$states}
			greyUnselected={true}
			controls={['slider', 'modelClick']}
		/>
	{/if}
</div>
