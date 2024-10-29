<script lang="ts">
	//import PlotSec from '$lib/plots/PlotSec.svelte';
	import PlotSec from '$lib/components/plots/PlotSec.svelte';
	import { ManDetails, ManSplit, parseFCJMans } from '$lib/analysis/splitting';
	import { States } from '$lib/analysis/state';
	import { FCJson } from '$lib/analysis/fcjson';
  import {MA} from '$lib/analysis/ma';
  import {createAnalyses} from '$lib/analysis/analysis';
	import {
		categories,
		schedules,
		manoeuvres,
		loadCategories,
		loadSchedules,
		loadManoeuvres,
		fcj,
    binData,
    origin,
    analyses
	} from '$lib/stores/analysis';
  import {base} from '$app/paths';
  import {goto} from '$app/navigation';
  export let data;

	let files: FileList | undefined;

	let range: number[] = [0, data.states.data.length];
	let mans: ManSplit[] = [ManSplit.TakeOff()];
	let compFlight: boolean = false;
	let activeMan = 0;


	const updateRange = (activeMan: number) => {
		const start = activeMan == 0 ? 0 : mans[activeMan - 1].stop;

		let stop = mans[activeMan].stop;

		if (!stop) {
			if (mans[activeMan].name == 'Landing') {
				stop = data.states.data.length;
			} else {
				switch (activeMan) {
					case 0:
						stop = 4500;
						break;
					case 1:
						stop = start! + 600;
						break;
					default:
						stop = start! + 2 * (start! - mans[activeMan - 2].stop!);
				}
			}
		}
		return [start, Math.min(stop, data.states.data.length)];
	};
	$: range = updateRange(activeMan);

	const setManoeuvre = (i: number, manoeuvre: ManSplit) => {
		mans[i] = manoeuvre;
		checkComp();
	};

	const setRange = () => {
		mans[activeMan].stop = Math.min(
			range[1],
			activeMan == mans.length - 1 ? data.states.data.length : mans[activeMan + 1].stop!
		);
		if (
			mans[activeMan].name != 'Landing' &&
			mans[activeMan].stop! < data.states.data.length &&
			activeMan == mans.length - 1
		) {
			addMan();
		}
	};

	const addMan = () => {
		//Add a new manoeuvre to the end of the list, make some assumptions about what it is based
		//on the previous manoeuvre
		if (activeMan < mans.length) {
			let name: string = 'Select';
			const manid = mans[activeMan].id;
			if (mans[activeMan].sinfo) {
				const shedmans = $manoeuvres[mans[activeMan].sinfo!.to_string()];
				if (manid! < Object.values(shedmans).length) {
					name = shedmans[manid!].name;
				} else {
					name = 'Landing';
				}
			}

			mans.push(
				new ManSplit(
					name,
					name == 'Landing' ? undefined : mans[activeMan].sinfo,
					mans[activeMan].id! + 1,
					undefined
				)
			);
		}
		activeMan += 1;
	};

	const deleteMan = (i: number) => {
		mans.splice(i, 1);
		activeMan = Math.max(activeMan - 1, 0);
    mans=mans;
	};

	const keyPress = (k: string) => {
		switch (k) {
			case 's':
				if (mans[activeMan].name != 'Select') {
					setRange();
				}
				break;
			case 'd':
				range[1] = Math.min(
					range[1] + 50,
					activeMan == mans.length - 1 ? data.states.data.length : mans[activeMan + 1].stop!
				);
				break;
			case 'a':
				range[1] = Math.max(range[1] - 50, range[0]);
				break;
		}
	};

	const clearSplitting = () => {
		activeMan = 0;
		mans = [ManSplit.TakeOff()];
	};

	const parseFCJ = (file: File) => {
		const reader = new FileReader();
		reader.onload = () => {
			if (reader.result) {
				$fcj = FCJson.parse(JSON.parse(reader.result as string));
			}
		};
		reader.readAsText(file);
	};

	$: if ($fcj) {
		parseFCJMans($fcj, data.states).then((res) => {
			mans = res;
      activeMan=1;
		});
	}

	const checkComp = (alerts = false) => {
		const fail = (msg: string) => {
			if (alerts) {
				alert(msg);
			}
			console.log(msg);
			compFlight = false;
		};

		if (mans[0].name != 'Takeoff') {
			return fail('Invalid Competition Flight, expected to start with Takeoff');
		}
		if (mans.length > 1) {
			if (!mans[1].sinfo) {
				return fail(
					'Invalid Competition Flight, expected first manoeuvre to have a category and schedule'
				);
			}
			const checkMans = $manoeuvres[mans[1].sinfo.to_string()];
			let failedMans: string[] = [];
			mans.slice(1, mans.length).forEach((man, i) => {
				if (i < checkMans.length && man.name != checkMans[i].name) {
					failedMans.push(`${i}: ${checkMans[i].name}`);
				}
			});
			if (failedMans.length > 0) {
				return fail(`Invalid Competition Flight, expected manoeuvres:\n${failedMans.join('\n')}`);
			}
		}
	};
  $: if(mans) {compFlight=true; checkComp(false);}


	function createAnalysis() {
		let direction = compFlight ? data.states.data[mans[0].stop!].direction_str() : 'Infer';
		let analysisMans: number[] = [];
		mans.forEach((man, i) => {
			if (man.sinfo) {
				analysisMans.push(i);
			}
		});

		createAnalyses(analysisMans.map((i) => mans[i].name));

    if ($binData) {$origin = Object.assign($origin!, $origin!.noMove())}

		analysisMans.forEach((id, i) => {
			analyses[i].set(
				new MA(
					mans[id].name,
					i + 1,
					id > 0 ? data.states.data[mans[id - 1].stop!].t : 0,
					data.states.data[mans[id].stop!].t,
					mans[id].sinfo!,
					direction,
					$fcj?.manhistory(id) || {},
					$manoeuvres[mans[id].sinfo!.to_string()][mans[id].id! - 1].k,
					$binData 
            ? undefined
						: new States(data.states.data.slice(id > 0 ? mans[id - 1].stop : 0, mans[id].stop))
						
				)
			);
		});
		goto(base + '/flight/results');
	}
</script>

<div class="col-8">
	<PlotSec flst={data.states} controls={['slider', 'rangeEndClick']} bind:range />
</div>

<div class="col-4">
	<div class="input-group-sm">
		{#if mans.length == 1}
			<input class="form-control-sm" type="file" accept=".json" bind:files />
			{#if files && files.length > 0}
				<button class="btn btn-outline-secondary form-control-sm" on:click={() => parseFCJ(files[0])}
					>Load</button
				>
			{/if}
		{:else}
			<button class="btn btn-outline-secondary form-control-sm" on:click={clearSplitting}
				>Clear</button
			>
      <span class="input-group-text-sm">{compFlight ? 'Competition' : 'Training'} </span>
      <button class="btn btn-outline-primary form-control-sm" on:click={createAnalysis}
				>Next</button
			>
		{/if} 
	</div>

	<table class="table-sm  align-middle container-fluid">
		<thead>
			<tr>
				<th>Manoeuvre</th>
				<th>End Time</th>
        <th>Split</th>
        <th>Delete</th>
			</tr>
		</thead>
		<tbody>
			{#each mans as man, i}
				<tr>
					{#if activeMan == i}
						<td class="p-1">
							<div class="dropdown">
								<button
									class="btn btn-sm dropdown-toggle"
									data-bs-toggle="dropdown"
									data-bs-placement="top"
									title="Select Manoeuvre {i}"
									on:click={() => {
										loadCategories();
										activeMan = i;
									}}
								>
									{man.name}
								</button>
								<ul class="dropdown-menu">
									<li><button tabindex="-1" class="dropdown-item" on:click={() => setManoeuvre(i, ManSplit.TakeOff(i, man.stop))}>Takeoff</button></li>
									<li><button tabindex="-1" class="dropdown-item" on:click={() => setManoeuvre(i, ManSplit.Break(i, man.stop))}>Break</button></li>
									<li><button tabindex="-1" class="dropdown-item" on:click={() => setManoeuvre(i, ManSplit.Landing(i, man.stop))}>Landing</button></li>
									{#each $categories as category}
										<li>
											<div class="dropdown dropend">
												<button
													tabindex="-1"
													class="dropdown-item dropdown-toggle"
													on:click={(e) => {
														e.stopPropagation();
														loadSchedules(category);
													}}
													data-bs-toggle="dropdown">{category}</button
												>
												<ul class="dropdown-menu dropdown-submenu">
													{#each $schedules[category] as schedule}
														<li>
															<div class="dropdown dropend">
																<button
																	tabindex="-1"
																	class="dropdown-item dropdown-toggle"
																	on:click={(e) => {
																		e.stopPropagation();
																		loadManoeuvres(category, schedule);
																	}}
																	data-bs-toggle="dropdown"
																>
																	{schedule}
																</button>
																<ul class="dropdown-menu dropdown-submenu">
																	{#each $manoeuvres[`${category}_${schedule}`] as manoeuvre}
																		<li>
																			<button
																				class="dropdown-item"
																				on:click={() =>
																					setManoeuvre(
																						i,
																						new ManSplit(
																							manoeuvre.name,
																							manoeuvre.sinfo,
																							manoeuvre.id,
																							man.stop
																						)
																					)}>{manoeuvre.name}</button
																			>
																		</li>
																	{/each}
																</ul>
															</div>
														</li>
													{/each}
												</ul>
											</div>
										</li>
									{/each}
								</ul>
							</div>
						</td>

						<td>
							{#if man.name != 'Select'}
								<button
									class="btn btn-sm"
									on:click={setRange}
									type="button"
									data-bs-placement="top"
									title="Set the end point of this manoeuvre to the end of the active range (or press 's')"
								>
                {#if man.stop && data.states.data[man.stop]}
									{`Update (${data.states.data[man.stop].t.toFixed(2)} -> ${data.states.data[range[1]].t.toFixed(2)})`}
                {:else}
                  {`Not set -> ${data.states.data[range[1]].t.toFixed(2)}`}
                {/if}
								</button>
							{/if}
						</td>
						{#if man.stop && range[1] < data.states.data.length && activeMan == mans.length - 1}
							<td>
								<button
									on:click={addMan}
									class="btn btn-sm"
									type="button"
									data-bs-placement="top"
									title="Add Manoeuvre">+</button
								>
							</td>
						{/if}
					{:else}
						<td>
							<button
              class="btn btn-sm"
              type="button"
              data-bs-placement="top"
              title="Activate {man.name}"
								on:click={() => {
									activeMan = i;
								}}>{man.name}</button
							>
						</td>
						<td><span class="text-sm">{man.stop ? data.states.data[man.stop].t.toFixed(2) : 'not set'}</span></td>
					{/if}
          <td>
            <button
            class="btn btn-sm"
            type="button"
            data-bs-placement="top"
            title="Delete {man.name}"
              on:click={() => {
                deleteMan(i);
              }}><small>X</small></button
            >
          </td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<svelte:window
	on:keydown={(e) => {
		keyPress(e.key);
	}}
/>