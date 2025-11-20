<script lang="ts">
	import PlotSec from '$lib/plots/PlotSec.svelte';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { FCJson } from '$lib/flight/fcjson';
	import { ManSplit, Splitting } from '$lib/flight/splitting.js';
	import { isFullSize } from '$lib/stores/shared';
	import { activeFlight } from '$lib/stores/shared';
	import Popup from '$lib/components/Popup.svelte';
	import ScheduleSelector from '$lib/schedule/ScheduleSelector.svelte';
	import type { DBManoeuvre, DBSchedule } from '$lib/schedule/db';
  import {schedule_id} from '$lib/leaderboards/stores';
  import {  nRunning } from '$lib/stores/analysis';
  import {get} from "svelte/store";

	let mans = $state($activeFlight!.segmentation!.mans);

	let showScheduleSelector: boolean = $state(false);

	let activeManId: number = $state(mans.length - 1);
	const activeMan = $derived(
		mans.length && activeManId < mans.length ? mans[activeManId] : undefined
	);

	let range: [number, number] = $state([
		activeManId > 0 ? mans[activeManId - 1].stop : 0,
		activeMan ? activeMan.stop : Math.min(2000, $activeFlight!.states.data.length - 1)
	]); // the visible range in the plot

	let activeIndex: number = $state(range[1]); // the current index (little plane)

	let newMan: ManSplit | undefined = $state(
		$activeFlight?.segmentation?.mans.length
			? undefined
			: ManSplit.takeOff(Math.min(2000, $activeFlight!.states.data.length - 1))
	);
	const thisMan = $derived(activeMan || newMan);
	function selectManoeuvre(i: number) {
		i = Math.max(i, 0);
		i = Math.min(i, mans.length);
		if (i < mans.length) {
			newMan = undefined;
		} else if (activeMan) {
			// The next manoeuvre
			const nextMan = activeMan.next();
			const lastLength = activeMan.stop - (mans.length > 1 ? mans[mans.length - 2].stop : 0);
			const nextI = Math.min(
				activeMan.stop + Math.min(lastLength, 500),
				$activeFlight!.states!.data.length - 1
			);

			if (nextMan == 'Landing') {
				newMan = ManSplit.landing($activeFlight!.states!.data.length);
			} else if (nextMan) {
				newMan = new ManSplit(nextMan, nextI);
			} else {
				newMan = new ManSplit(undefined, nextI);
			}
		} else {
			//The first manoeuvre
			newMan = ManSplit.takeOff(Math.min(2000, $activeFlight!.states.data.length - 1));
		}
		activeManId = i;

		range = [
			i == 0 ? 0 : mans[i - 1].stop,
			Math.min(
				activeMan ? activeMan.stop : newMan!.stop + 500,
				$activeFlight!.states!.data.length - 1
			)
		];
		activeIndex = activeMan?.stop || newMan!.stop;
	}

	const parseFCJ = (file: File) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			Splitting.parseFCJ(
				FCJson.parse(JSON.parse(e.target?.result as string)),
				$activeFlight!.states!
			).then((res) => {
				mans = res.mans;
				selectManoeuvre(mans.length - 1);
			});
		};
		reader.readAsText(file);
	};

	function changeManoeuvre(manoeuvre: DBManoeuvre | 'Landing' | 'Break') {
		if (newMan) {
			newMan = new ManSplit(manoeuvre, newMan.stop, newMan.fixed, newMan.mdef);
		} else if (activeMan) {
			mans[activeManId] = new ManSplit(manoeuvre, activeMan.stop, activeMan.fixed, activeMan.mdef);
		}
	}

	let rangeLimits: [number, number] = $derived([
		0,
		activeManId < mans.length - 1
			? mans[activeManId + 1].stop
			: $activeFlight!.states.data.length - 1
	]);

  function nextManoeuvre() {
    selectManoeuvre(activeManId + 1);
    if (newMan?.name=="Landing") {
      setManoeuvre();
    }
  }

  function setManoeuvre () {
    const man = Object.assign(thisMan!, { stop: activeIndex });
    if (newMan) {
      mans = [...mans, man];
      newMan = undefined;
    } else {
      mans[activeManId] = man;
    }
    selectManoeuvre(activeManId);

    
    $activeFlight = $activeFlight!.withNewSegmentation(new Splitting(mans));
    

  }

</script>

<svelte:window
	onkeyup={(e) => {
    if (get(nRunning)) {return}
		switch (e.key) {
			case "Enter":
      case "NumpadEnter":

        if (thisMan && thisMan.name!=="Landing" ) {
          if (newMan && (newMan.schedule_id || typeof newMan.manoeuvre === 'string')) {
					setManoeuvre();
				} else {
					nextManoeuvre();
				}
        }
				

				break;
		}
	}}
/>

<div class="container-fluid d-flex flex-column justify-content-between align-items-stretch p-2">
	<div class="col container-fluid border rounded p-0">
		<PlotSec
			bind:i={activeIndex}
			bind:range
			bind:rangeLimits
			flst={$activeFlight!.states}
			greyUnselected={true}
			controls={['slider', 'modelClick']}
			scale={$isFullSize ? 3.5 : 1.5}
		/>
	</div>

	<div class="col-auto pt-1">
		<div class="row justify-content-center">
			<div id="manselect" class="col-auto btn-group p-0 text-nowrap dropup btn-group-sm">
				<button
					class="btn btn-outline-secondary"
					title="previous manoeuvre"
					aria-label="Previous manoeuvre"
					disabled={activeManId == 0}
					onclick={() => {
						selectManoeuvre(activeManId - 1);
					}}
				>
					<i class="bi bi-arrow-left"></i>
				</button>
				<button
					class="btn btn-outline-secondary"
					data-bs-toggle="tooltip"
					title="Delete this manoeuvre"
					aria-label="Delete"
					disabled={activeManId < mans.length - 1 ||
						(activeManId < mans.length - 1 && mans[activeManId].fixed)}
					onclick={() => {
						selectManoeuvre(activeManId - 1);
						mans = mans.slice(0, mans.length - 1);
					}}
				>
					<bi class="bi bi-trash"></bi>
				</button>
				<div class="btn-group btn-group-sm" role="group">
					<button
						class="btn btn-outline-secondary dropdown-toggle"
						data-bs-toggle="dropdown"
						aria-expanded="false"
						aria-label="Toggle Dropdown"
					>
						<i class="bi bi-gear"></i>
					</button>

					<ul class="dropdown-menu" style="max-height:300px; overflow-y:auto;">
          
            <label class="dropdown-item">
              <input
                type="file"
                name="input-name"
                style="display: none;"
                accept=" .json"
                title="Load manoeuvre segmentation from Flight Coach JSON file"
                onchange={(e: Event) => {
                  const files = (e.target as HTMLInputElement).files!;
                  if (files.length > 0) {
                    parseFCJ(files[0]);
                  }
                }}
              />
              <span>Load Segmentation from FC Json</span>
            </label>
						
						<button
							class="dropdown-item"
							title="Undo changes made in this session"
							onclick={() => {
								mans = $activeFlight?.segmentation!.mans!;
								selectManoeuvre(0);
							}}
						>
							Reset Segmentation
						</button>
						<button
							id="clear-splitting"
							class="dropdown-item"
							title="Clear the manoeuvre segmentation completely"
							onclick={() => {
								mans = [];
								selectManoeuvre(0);
							}}
						>
							Clear Segmentation
						</button>
					</ul>
				</div>

				{#if thisMan?.name == "TakeOff"}
					<button
						class="col-auto btn btn-outline-secondary dropdown-toggle"
						aria-expanded="false"
						aria-label="Toggle Dropdown"
						disabled={true}
						title="Select manoeuvre from schedule library"
					>
						{thisMan.name}
					</button>
				{:else if thisMan?.schedule || thisMan?.name =="Landing" || thisMan?.name =="Break"}
					<div class="btn-group btn-group-sm" role="group">
						<button
							class="col-auto btn btn-outline-secondary dropdown-toggle"
							data-bs-toggle="dropdown"
							aria-expanded="false"
							aria-label="Toggle Dropdown"
							disabled={thisMan.name == "TakeOff"}
							title="Select manoeuvre from schedule library"
						>
							{thisMan.name || 'Select Manoeuvre'}
						</button>
						<ul class="dropdown-menu" style="max-height:300px; overflow-y:auto;">
							<button
								onclick={() => {
									showScheduleSelector = true;
								}}
								class="dropdown-item"
							>
								Select Schedule
							</button>
              {#if thisMan?.schedule}
							<div class="dropdown-divider"></div>
							<div class="dropdown-header text-sm py-0">
								{thisMan?.schedule?.repr().toUpperCase()}
							</div>
							{#each thisMan.schedule?.manoeuvres as manoeuvre}
								<button
									class="dropdown-item {manoeuvre == thisMan.manoeuvre ? 'active' : ''}"
									onclick={() => {
										changeManoeuvre(manoeuvre);
									}}
								>
									{manoeuvre.name}
								</button>
							{/each}
                {/if}
							<div class="dropdown-divider"></div>
							<button
								class="dropdown-item {(newMan || activeMan)?.manoeuvre == 'Break' ? 'active' : ''}"
								onclick={() => {
									changeManoeuvre('Break');
								}}
							>
								Break
							</button>
							<button
								class="dropdown-item {(newMan || activeMan)?.manoeuvre == 'Landing'
									? 'active'
									: ''}"
								onclick={() => {
									changeManoeuvre('Landing');
								}}
							>
								Landing
							</button>
						</ul>
					</div>
				{:else}
					<button
						class="col-auto btn btn-outline-secondary"
						onclick={() => (showScheduleSelector = true)}
						title="Select manoeuvre from schedule library"
						>Select Schedule
					</button>
				{/if}

				{#if activeManId == mans.length - 1 && activeMan?.name == 'Landing'}
					<button
						class="btn btn-outline-primary form-control-sm"
						onclick={() => {
							
							goto(resolve('/flight/results'));
						}}
					>
						Complete
					</button>
				{:else}
					<button
						class="btn btn-outline-secondary px-2"
						title="Save manoeuvre"
						aria-label="Set Manoeuvre"
						disabled={!(thisMan?.schedule || typeof thisMan?.manoeuvre === 'string') || !!$nRunning}
						onclick={setManoeuvre}
					>
						Set {#if newMan}(⏎){/if}
					</button>
					<button
						class="btn btn-outline-secondary px-2"
						title="Next manoeuvre"
						aria-label="Next manoeuvre"
						disabled={!!newMan}
						onclick={nextManoeuvre}
					>
						Next {#if !newMan}(⏎){/if}
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>

<Popup bind:show={showScheduleSelector}>
	<ScheduleSelector
		category={thisMan?.schedule?.category_name}
		onselected={(schedule) => {
      $schedule_id = schedule.schedule_id;
			showScheduleSelector = false;
			changeManoeuvre(schedule.manoeuvres[0]);
		}}
	/>
</Popup>
