<script lang="ts">
	import PlotSec from '$lib/components/plots/PlotSec.svelte';
	import { ManSplit, parseFCJMans } from '$lib/analysis/splitting';
	import { createAnalysis } from '$lib/analysis/analysis';
	import { isCompFlight, states, fcj } from '$lib/stores/analysis';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { FCJson } from '$lib/analysis/fcjson';
	import ScheduleSelect from '$lib/components/ScheduleSelect.svelte';
	import { type Schedule, type Manoeuvre } from '$lib/schedules';

	let mans: ManSplit[] = [ManSplit.TakeOff(undefined)];
	let activeManId: number = 0;
	let activeIndex: number = 0;
  let visibleRange: [number, number] = [0, $states!.data.length];
	let range: [number, number] = [0, $states!.data.length];
	$: activeMan = mans[activeManId];

	$: if (activeMan) {
		range = [
			activeManId > 0 ? mans[activeManId - 1].stop! : 0,
			activeMan.stop || $states!.data.length
		];
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
    mans=[ManSplit.TakeOff(undefined)];
		parseFCJMans($fcj, $states!).then((res) => {
			mans = res;
			activeManId = 1;
		});
	}

	const addMan = () => {
    let new_man: ManSplit;
    if (activeMan.schedule && activeMan.manoeuvre) {
      const lastMan = activeMan.manoeuvre as Manoeuvre;
      new_man = new ManSplit(activeMan.schedule, activeMan.schedule.manoeuvres[lastMan.index]);
    } else {
      new_man = ManSplit.Empty();
    }
		mans = [...mans, new_man];
		activeManId = mans.length - 1;
	};

  const setRange = (man: ManSplit) => {
    if (activeManId==0 || activeIndex >= mans[activeManId-1].stop! ) {
      if (activeManId < mans.length-2 || !mans[activeManId+1].stop || activeIndex <= mans[activeManId+1].stop!) 
      man.stop = activeIndex;
      range = [range[0], man.stop!];
    }
  }

</script>




<svelte:window
	on:keydown={(e) => {
		switch (e.key) {
      case 's':
        setRange(activeMan);
        break;
      case 'Enter':
        if (mans[mans.length-1].manoeuvre) {addMan();}
        break;
    }
	}}
/>




<div class="col-8">
	{#if $states}
		<PlotSec
			bind:i={activeIndex}
			bind:range
      bind:visibleRange
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
			<button class="btn btn-outline-secondary form-control-sm" on:click={()=>{activeManId=0;mans=[ManSplit.TakeOff()];}}> Clear </button>
			<span class="input-group-text-sm">{$isCompFlight ? 'Competition' : 'Training'} </span>
			<button
				class="btn btn-outline-primary form-control-sm"
				on:click={() => {
					createAnalysis($states!, mans);
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
									manoeuvre={man.manoeuvre}
									onselected={(schedule: Schedule, manoeuvre: Manoeuvre) => {
										man.schedule = schedule;
                    man.manoeuvre = manoeuvre;
									}}
								/>
						</td>
					{/if}
					{#if activeManId == i}
						<td
							role="button"
							on:click={()=>setRange(man)}>Set (s)</td
						>
						<td
							role="button"
							on:click={() => {
								console.log(`split at ${activeIndex}`);
							}}>Split</td
						>
						
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
      {#if mans[mans.length-1].manoeuvre && mans[mans.length-1].manoeuvre != 'Landing'}
      <tr>
        <td colspan="6" role="button" on:click={addMan}>Add (return)</td>
      </tr>
      {/if}
		</tbody>
	</table>
</div>
