<script lang="ts">
	import PlotSec from '$lib/components/plots/PlotSec.svelte';
	import { ManSplit, parseFCJMans, Splitting } from '$lib/analysis/splitting';
	import { newAnalysis } from '$lib/analysis/analysis';
	import { isCompFlight, states, fcj } from '$lib/stores/analysis';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { FCJson } from '$lib/analysis/fcjson';
	import ScheduleSelect from '$lib/components/ScheduleSelect.svelte';
	import { type Schedule, type Manoeuvre, loadManDef } from '$lib/schedules';

	let mans: ManSplit[] = [ManSplit.TakeOff()];
	let activeManId: number = 0;
	let activeIndex: number = 0;
	let range: [number, number] = [0, $states!.data.length];
	$: activeMan = mans[activeManId];

	$: if (activeMan) {

    if (activeManId>0) {
      const _lastLen = mans[activeManId - 1].stop! - (activeManId > 1 ? mans[activeManId - 2].stop! : 0);
      range = [
        mans[activeManId - 1].stop!,
        activeMan.stop || Math.min(mans[activeManId - 1].stop! + _lastLen * 2, $states!.data.length)
      ];  
    } else {
      range = [0, $states!.data.length];
    }
	}

	const parseFCJ = (file: File) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			$fcj = FCJson.parse(JSON.parse(e.target?.result as string));
		};
		reader.readAsText(file);
	};

	$: if ($fcj) {
		activeManId = 0;
		mans = [ManSplit.TakeOff()];
		parseFCJMans($fcj, $states!).then((res) => {
			mans = res;
			activeManId = 1;
		});
	}

	const addMan = () => {
		let new_man: ManSplit;

		const lastSchedule = activeMan.schedule;
		const lastMan = activeMan.manoeuvre;
		if (lastSchedule && lastMan) {
			if (lastSchedule && lastMan.index == lastSchedule.manoeuvres.length) {
				new_man = ManSplit.Landing($states?.data.length);
			} else {
				new_man = new ManSplit(lastSchedule, lastSchedule.manoeuvres[lastMan.index]);
			}
		} else {
			new_man = ManSplit.Empty();
		}
		mans = [...mans, new_man];
		activeManId = mans.length - 1;
		activeIndex =
			activeMan.stop || Math.min(mans[activeManId - 1].stop! + 1000, $states!.data.length);
    
	};

	const setRange = (man: ManSplit) => {
		let canSet = true;
		if (activeManId > 0 && activeIndex < mans[activeManId - 1].stop!) {
			canSet = false;
		} else if (
			activeManId < mans.length - 1 &&
			mans[activeManId + 1].stop &&
			activeIndex > mans[activeManId + 1].stop!
		) {
			canSet = false;
		}
		if (canSet) {
			man.stop = activeIndex;
			range = [range[0], man.stop!];
			mans = mans;
		}
	};
</script>

<svelte:window
	on:keydown={(e) => {
		switch (e.key) {
			case 's':
				setRange(activeMan);
				break;
			case 'Enter':
				if (mans[mans.length - 1].manoeuvre) {
					addMan();
				}
				break;
		}
	}}
/>

<div class="col-8">
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

<div class="col-4">
	<div class="input-group-sm">
		{#if mans.length == 1}
			<label class="btn btn-outline-secondary form-control-sm">
				<input
					type="file"
					name="input-name"
					style="display: none;"
					accept=" .json"
					on:change={(e: Event) => {
						if (e.target?.files?.length > 0) {
							parseFCJ(e.target.files[0]);
						}
					}}
				/>
				<span>Parse FCJ</span>
			</label>
		{:else}
			<button
				class="btn btn-outline-secondary form-control-sm"
				on:click={() => {
					activeManId = 0;
					mans = [ManSplit.TakeOff()];
				}}
			>
				Clear
			</button>
			<span class="input-group-text-sm">{$isCompFlight ? 'Competition' : 'Training'} </span>
			<button
				class="btn btn-outline-primary form-control-sm"
				on:click={() => {
					newAnalysis($states!, new Splitting(mans));
					goto(base + '/flight/results');
				}}
			>
				Next
			</button>
		{/if}
	</div>

	<table class="table-sm table-bordered align-middle container-fluid text-center">
		<thead>
			<tr>
				<th scope="col" class="col-1"></th>
				<th scope="col" class="col-2">Manoeuvre</th>
				<th colspan="4" scope="col" class="col-7">Action</th>
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
					{:else}
						<td class="dropdown-toggle" role="button" data-bs-toggle="dropdown">
							{man.name}
							<ScheduleSelect
                level="manoeuvre"
								onselected={(schedule, manoeuvre) => {
									man.schedule = schedule;
                  if (manoeuvre) {
                    man.manoeuvre = manoeuvre;
                    loadManDef(man.manoeuvre.id).then(manDef =>{man.mdef = manDef});
                  }
								}}
							/>
						</td>
					{/if}
					{#if activeManId == i}
						{#if activeMan.alternate_name != 'Landing'}
							<td role="button" on:click={() => setRange(man)}>Set (s)</td>

							<td
								role="button"
								on:click={() => {
									console.log(`split at ${activeIndex}`);
								}}>Split</td
							>
						{/if}
						{#if !man.fixed}
							<td
								role="button"
								on:click={() => {
									activeManId = activeManId - 1;
									mans.splice(activeManId + 1, 1);
									mans = mans;
								}}>Delete</td
							>
						{/if}
					{:else}
						<td colspan="3"></td>
					{/if}
				</tr>
			{/each}
			{#if mans[mans.length - 1].manoeuvre || mans[mans.length - 1].alternate_name != 'Landing'}
				{#if mans[mans.length - 1].stop}
					<tr>
						<td colspan="6" role="button" on:click={addMan}>Add (return)</td>
					</tr>
				{/if}
			{/if}
		</tbody>
	</table>
</div>
