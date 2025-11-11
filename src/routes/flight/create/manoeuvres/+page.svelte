<script lang="ts">
	import SideBarLayout from '$lib/components/SideBarLayout.svelte';
	import PlotSec from '$lib/plots/PlotSec.svelte';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { FCJson } from '$lib/flight/fcjson';
	import { loadManDef, library } from '$lib/schedule/library.js';
	import ManSelect from '$lib/flight/ManoeuvreSelecter.svelte';
	import * as ms from '$lib/flight/splitting.js';
	import { isFullSize } from '$lib/stores/shared';
	import { activeFlight } from '$lib/stores/shared';

	const baseSplits = $activeFlight!.segmentation?.mans!;
	let mans = $state(baseSplits);

	let activeManId: number = $state(0);

	let range: [number, number] = $state([
		0,
		baseSplits[0].stop === undefined
			? Math.min(3000, $activeFlight!.states!.data.length - 1)
			: baseSplits[0].stop
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
		if (newStop === undefined) {
			if (activeManId == 0) {
				newStop = $activeFlight!.states!.data.length / 8;
			} else {
				newStop = 2 * newStart - (activeManId > 1 ? mans[activeManId - 2].stop! : 0);
			}
			range = [newStart, Math.min(newStop + 500, $activeFlight!.states!.data.length - 1)];
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
				? $activeFlight!.states!.data.length - 1
				: mans[activeManId + 1].stop || $activeFlight!.states!.data.length - 1;

		if (activeIndex > lastAllowedIndex) {
			alert('Cannot set point beyone the end of the next manoeuvre');
			activeIndex = lastAllowedIndex - 1;
		} else {
			mans[activeManId].stop = activeIndex;
			resetRange();
		}
	};

	const parseFCJ = (file: File) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			ms.parseFCJMans(FCJson.parse(JSON.parse(e.target?.result as string)), $activeFlight!.states!)
				.then((res) => ms.loadManDefs(res))
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

<SideBarLayout sideBarWidth={3}>
	{#snippet side()}
		<div class="row p-0">
			<span class="h4 fw-bold text-start px-4 mt-2">Segment into Manoeuvres</span>
		</div>
		<hr class="mt-0" />
		<div class="pt-2 btn-group w-100">
			<label class="btn btn-outline-secondary">
				<input
					type="file"
					name="input-name"
					style="display: none;"
					accept=" .json"
					onchange={(e: Event) => {
						const files = (e.target as HTMLInputElement).files!;
						if (files.length > 0) {
							reset();
							parseFCJ(files[0]);
						}
					}}
				/>
				<span>FC Json</span>
			</label>

			<button
				id="clear-splitting"
				class="btn btn-outline-secondary"
				onclick={() => {
					reset();
				}}
			>
				Clear
			</button>
		</div>
		<hr />
		<div class="row">
			<table class="table table-sm align-middle text-center table-noborder">
				<thead>
					<tr>
						<th scope="col" class="col-1 bg-light"></th>
						<th scope="col" class="col-2 bg-light text-start">Manoeuvre</th>
						<th scope="col" class="col-7 bg-light">end t (s)</th>
					</tr>
				</thead>
				<tbody>
					{#each mans as man, i}
						<tr>
							<td class="bg-light p-1">
								<input
									class="radio"
									type="radio"
									name="manSelect"
									bind:group={activeManId}
									onchange={resetRange}
									value={i}
								/>
							</td>

							<td class="text-start bg-light p-1">
								{#if man.manoeuvre}{man.manoeuvre?.index}:
								{/if}{man.manoeuvre?.short_name || man.alternate_name}
							</td>

							<td class="bg-light p-1">
								{i == 0
									? 0
									: mans[i].stop
										? $activeFlight!.states!.t[mans[i].stop!]?.toFixed(1) || "-"
										: '-'}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		{#if mans.length && mans[mans.length - 1].alternate_name == 'Landing'}
			<div class="row">
				<button
					class="btn btn-outline-primary form-control-sm"
					onclick={() => {
						const newSplitting = new ms.Splitting(mans);

						if (!ms.Splitting.equals(newSplitting, $activeFlight?.segmentation)) {
							console.log('splitting has been modified');
							$activeFlight = $activeFlight!.withNewSegmentation(newSplitting);
						}
						goto(resolve('/flight/results'));
					}}
				>
					Complete
				</button>
			</div>
		{/if}
	{/snippet}
	{#snippet main()}
		<div
			class="container-fluid d-flex flex-column justify-content-between align-items-stretch h-100 p-0"
		>
			<div class="col container-fluid border rounded p-0">
				<PlotSec
					bind:i={activeIndex}
					bind:range
					flst={$activeFlight!.states!}
					greyUnselected={true}
					controls={['slider', 'modelClick', 'scale']}
					scale={$isFullSize ? 3.5 : 1.5}
				/>
			</div>

			<div class="col-auto pt-1">
				<div class="row w-100 justify-content-center">
					<label for="manselect" class="col-auto col-form-label small px-1"
						>{activeManId}/{mans.length - 2}</label
					>
					<div id="manselect" class="col-auto btn-group p-0 text-nowrap">
						<button
							class="btn btn-outline-secondary px-2"
							title="previous manoeuvre"
							aria-label="Previous manoeuvre"
							disabled={activeManId == 0}
							onclick={() => {
								activeManId = activeManId - 1;
								resetRange();
							}}><i class="bi bi-arrow-left"></i></button
						>
						<button
							class="btn btn-outline-secondary px-2"
							title="Next manoeuvre"
							aria-label="Next manoeuvre"
							disabled={activeManId == mans.length - 1}
							onclick={() => {
								activeManId = activeManId + 1;
								resetRange();
							}}><i class="bi bi-arrow-right"></i></button
						>
					</div>
					<div class="col-auto text-nowrap text-center " style="width: 180px;">
						<ManSelect
							library={$library}
							bind:old_man={mans[activeManId]}
							onselected={(nms: ms.Split) => {
								mans[activeManId] = Object.assign(mans[activeManId], nms);
							}}
							ondeselect={() => {
								mans[activeManId].manoeuvre = undefined;
								mans[activeManId].mdef = undefined;
							}}
							specialManoeuvres={activeManId == mans.length - 1 ? ['Break', 'Landing'] : ['Break']}
						/>
					</div>

					<div class="col-auto btn-group p-0 text-nowrap" style="width: 130px;">
						{#if mans[activeManId].alternate_name != 'Landing'}
							<button
								class="btn btn-outline-secondary w-100"
								data-bs-toggle="tooltip"
								title="Set the end point of this manoeuvre to the point identified by the little plane"
								onclick={() => {
									setRange();
								}}
							>
								Set
							</button>
						{/if}

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

						{#if canAdd}
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
						{/if}
					</div>
					{#if mans.length && mans[mans.length - 1].alternate_name == 'Landing'}
						<div class="col-auto">
							<button
								class="btn btn-outline-primary form-control-sm"
								onclick={() => {
									const newSplitting = new ms.Splitting(mans);

									if (!ms.Splitting.equals(newSplitting, $activeFlight?.segmentation)) {
										console.log('splitting has been modified');
										$activeFlight = $activeFlight!.withNewSegmentation(newSplitting);
									}
									goto(resolve('/flight/results'));
								}}
							>
								Complete
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/snippet}
</SideBarLayout>
