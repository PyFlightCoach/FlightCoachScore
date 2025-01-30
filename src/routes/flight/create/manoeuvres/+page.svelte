<script lang="ts">
	import PlotSec from '$lib/components/plots/PlotSec.svelte';
	import { newAnalysis } from '$lib/flight/analysis.js';
	import { states, fcj, bin, manSplits, isCompFlight } from '$lib/stores/analysis';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { FCJson } from '$lib/flight/fcjson';
	import { loadManDef, library } from '$lib/schedule/library.js';
	import ManSelect from '$lib/flight/ManoeuvreSelecter.svelte';
	import * as ms from '$lib/flight/splitting.js';

	const { data } = $props();

	let mans = $state(data.baseSplits);

	$effect(() => {
		$manSplits = mans;
	});

	let activeManId: number = $state(0);

	let range: [number, number] = $state([
		0,
		data.baseSplits[0].stop || Math.min(3000, $states!.data.length - 1)
	]);

	let activeIndex: number = $state(range[1]);

	let canAdd: boolean = $derived(
		Boolean(
			mans.length &&
				(mans[mans.length - 1].manoeuvre ||
					(mans[mans.length - 1].alternate_name &&
						mans[mans.length - 1].alternate_name != 'Landing')) &&
				mans[mans.length - 1].stop
		)
	);

	const resetRange = () => {
		let newStop = mans[activeManId].stop;
		let newStart = activeManId == 0 ? 0 : mans[activeManId - 1].stop!;
		if (!newStop) {
			if (activeManId == 0) {
				newStop = $states!.data.length / 8;
			} else {
				newStop = 2 * newStart - (activeManId > 1 ? mans[activeManId - 2].stop! : 0);
			}
			range = [newStart, Math.min(newStop + 500, $states!.data.length - 1)];
		} else {
			range = [newStart, newStop];
		}

		activeIndex = newStop;
	};

	const addMan = async (man: ms.Split | undefined = undefined) => {
		if (mans[mans.length - 1].manoeuvre) {
			mans[mans.length - 1].mdef = await loadManDef(mans[mans.length - 1].manoeuvre!.id);
		}
		mans.push(man || ms.next(mans[mans.length - 1]));

		activeManId = mans.length - 1;
		resetRange();
	};

	const reset = () => {
		activeManId = 0;
    mans = [ms.takeOff()];
		resetRange();
	};

	const setRange = () => {
		const lastAllowedIndex =
			activeManId == mans.length - 1
				? $states!.data.length - 1
				: mans[activeManId + 1].stop || $states!.data.length - 1;

		if (activeIndex > lastAllowedIndex) {
			alert('Cannot set point beyone the end of the next manoeuvre');
			activeIndex = lastAllowedIndex - 1;
		} else {
			mans[activeManId].stop = activeIndex;
			resetRange();
		}
	};

	const parseFCJ = (file: File) => {
		$fcj = undefined;
		const reader = new FileReader();
		reader.onload = (e) => {
			$fcj = FCJson.parse(JSON.parse(e.target?.result as string));
			ms.parseFCJMans($fcj, $states!)
				.then(res => {
          return ms.loadManDefs(res);
        })
				.then((res) => {
					mans = res;
				});
		};
		reader.readAsText(file);
	};
</script>

<svelte:window
	onkeydown={(e) => {
		switch (e.key) {
			case 'Enter':
				if (activeManId == mans.length - 1) {
					if (!mans[activeManId].stop) {
						setRange();
					} else if (mans[mans.length - 1].manoeuvre || mans[mans.length - 1].alternate_name) {
						addMan();
					}
				}
				break;
		}
	}}
/>

<div
	class="col-md-4 pt-3 bg-light border mh-100 d-flex flex-column overflow-auto"
	style="max-height: 100%;"
>
	<div class="row">
		{#if $bin || $fcj}
			<span class="col-auto">Source File:</span>
			<span class="col text-nowrap overflow-auto">{$bin?.name || $fcj?.name || 'unknown'}</span>
		{/if}
	</div>
	<div class="row pt-2">
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
								const files = (e.target as HTMLInputElement).files!;
								if (files.length > 0) {
									parseFCJ(files[0]);
								}
							}}
						/>
						<span>Browse</span>
					</label>
				</div>
			</div>
		{:else}
			<div class="row pt-2">
				<label for="clear-splitting" class="col col-form-label">Clear Manoeuvres:</label>
				<button
					id="clear-splitting"
					class="btn btn-outline-secondary form-control-sm col"
					onclick={() => {
						$fcj = undefined;
						reset();
					}}
				>
					Clear
				</button>
			</div>
		{/if}
	</div>
	<hr />
	<div class="row">
		<table class="table-sm align-middle text-center">
			<thead>
				<tr>
					<th scope="col" class="col-1"></th>
					<th scope="col" class="col-2 text-start">Manoeuvre</th>
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
								bind:group={activeManId}
								onchange={resetRange}
								value={i}
							/></td
						>

						{#if i == 0 || activeManId != i}
							<td class="text-start">
								{#if man.manoeuvre}{man.manoeuvre?.index}:
								{/if}{man.manoeuvre?.short_name || man.alternate_name}
							</td>
						{:else if activeManId == i}
							<td>
								<ManSelect
									library={$library}
									old_man={man}
									onselected={(nms: ms.Split) => {
										mans[i] = Object.assign(mans[i], nms);
									}}
									ondeselect={() => {
										mans[i].manoeuvre = undefined;
										mans[i].mdef = undefined;
									}}
									specialManoeuvres={i == mans.length - 1 ? ['Break', 'Landing'] : ['Break']}
								/>
							</td>
						{/if}
						{#if activeManId == i}
							{#if mans[activeManId].alternate_name != 'Landing'}
								<td>
									<button
										class="btn btn-outline-secondary w-100"
										data-bs-toggle="tooltip"
										title="Set the end point of this manoeuvre to the point identified by the little plane"
										onclick={() => {
											setRange();
										}}
									>
										{mans[activeManId].stop ? 'Update' : 'Set (⏎)'}
									</button>
								</td>
							{/if}
							{#if !man.fixed}
								<td>
									<button
										class="btn btn-outline-secondary w-100"
										data-bs-toggle="tooltip"
										title="Delete this manoeuvre"
										onclick={() => {
											activeManId = activeManId - 1;
											mans.splice(activeManId + 1, 1);
											resetRange();
										}}
									>
										Delete
									</button>
								</td>
							{/if}
						{:else}
							<td colspan="2"></td>
						{/if}
					</tr>
				{/each}
				{#if canAdd}
					<tr>
						<td colspan="6">
							<button
								class="btn btn-outline-secondary w-100"
								onclick={() => {
									addMan();
								}}
							>
								Add{mans[activeManId].stop &&
								(mans[activeManId].manoeuvre || mans[activeManId].alternate_name)
									? '(⏎)'
									: ''}
							</button>
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>

	{#if mans.length && mans[mans.length - 1].alternate_name == 'Landing'}
		<hr />
		<div class="row">
			<button
				class="btn btn-outline-primary form-control-sm"
				onclick={() => {
					newAnalysis($states!, new ms.Splitting(mans));
					goto(base + '/flight/results');
				}}
			>
				Complete
			</button>
		</div>
	{/if}
</div>

<div class="col-md-8">
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
