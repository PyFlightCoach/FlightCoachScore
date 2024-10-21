<script lang="ts">
	//import PlotSec from '$lib/plots/PlotSec.svelte';
	import type { States } from '$lib/analysis/state';
  import NavMenu from "$lib/components/NavMenu.svelte";
	import { FCJson } from '$lib/analysis/fcjson';
	import { ManSplit  } from '$lib/analysis/splitting';
	import {
		categories,
		schedules,
		manoeuvres,
		loadCategories,
		loadSchedules,
		loadManoeuvres
	} from '$lib/stores/analysis';
	

	export let compFlight: boolean = false;
	export let states: States;
	export let mans: ManSplit[] = [ManSplit.TakeOff()];
	export let fcj: FCJson | undefined = undefined;
	export let modified: boolean = false;

	export let activeMan = 0;
	let range: number[] = [0, states.data.length];
	let msddOpen = false;
	let stddOpen = false;

	const removeFCJ = (reason: string = 'unknown') => {
		if (fcj) {
			console.log(`Removing FCJ: ${reason}`);
			fcj = undefined;
		}
	};


	const updateRange = (activeMan: number) => {
		const start = activeMan == 0 ? 0 : mans[activeMan - 1].stop!;

		let stop = mans[activeMan].stop;

		if (!stop) {
			if (mans[activeMan].name == 'Landing') {
				stop = states.data.length;
			} else {
				switch (activeMan) {
					case 0:
						stop = 4500;
						break;
					case 1:
						stop = start + 600;
						break;
					default:
						stop = start + 2 * (start - mans[activeMan - 2].stop!);
				}
			}
		}
		return [start, Math.min(stop, states.data.length)];
	};
	$: range = updateRange(activeMan);


	const setManoeuvre = (i: number, manoeuvre: ManSplit) => {
		mans[i] = manoeuvre;
		msddOpen = false;
		checkComp();
		removeFCJ('manoeuvre changed');
	};


	const setRange = () => {
		mans[activeMan].stop = Math.min(
			range[1],
			activeMan == mans.length - 1 ? states.data.length : mans[activeMan + 1].stop!
		);
		if (
			mans[activeMan].name != 'Landing' &&
			mans[activeMan].stop! < states.data.length &&
			activeMan == mans.length - 1
		) {
			addMan();
		}
		removeFCJ('manoeuvre end point modified');
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
		removeFCJ('manoeuvre added');
	};


	const deleteMan = (i: number) => {
		mans.splice(i, 1);
		activeMan = Math.max(activeMan - 1, 0);
		removeFCJ('manoeuvre deleted');
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
					activeMan == mans.length - 1 ? states.data.length : mans[activeMan + 1].stop!
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
		stddOpen = false;
		removeFCJ('manoeuvres cleared');
	};

	const parseFCJ = (event) => {

		const reader = new FileReader();
		reader.onload = () => {
			if (reader.result) {
				fcj = FCJson.parse(JSON.parse(reader.result as string));
			}
			
		};
		reader.readAsText(event.target.files[0]);
		stddOpen = false;
	};

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
			let failedMans = [];
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

	$: if (compFlight) {checkComp(true);}
	
</script>

<h4>3 - Define the Manoeuvres</h4>
<list class="space-y-1 text-gray-500 dark:text-gray-400">
  <li>
    The manoeuvre splitting can be done manually by selecting each manoeuvre and its end point.
  </li>
  <li>
    If a FC json file is available the manoeuvre splitting is loaded from that by default, you can
    also load the splitting from an FC JSon at this stage.
  </li>
  <li>
    Manual splitting is best done from the start. First adjust the plot so that the region up to
    the start of the first manoevure is visible by sliding the slider, clicking on the ribbon or
    pressing the 'a' and 'd' keys.
  </li>
  <li>
    When the you are happy with the split location click on 'Set Range' in the table, or press the
    's' key.
  </li>
  <li>Carry on selecting each manoeuvre and its end point for the whole flight.</li>
  <li>
    A flight does not need to contain all the manoevures from a schedule in order, but it can only
    be used as a valid competition flight if it does.
  </li>
  <li>
    For a competition flight then the correct direction of each manoeuvre is established based on
    the direction in which the first manoeuvre was flown. For a training flight the direction is
    assumed to be correct.
  </li>
  <li>
    When you have finished splitting the manoeuvres click on 'Setup Analysis' to move onto the
    next stage.
  </li>
</list>
<div class="parent">
	<div class="plot">
		<PlotSec flst={states} controls={['slider', 'rangeEndClick']} bind:range />
	</div>
			<NavMenu>Load FCJ</NavMenu>
			<Dropdown bind:open={stddOpen}>
				<DropdownItem>
					<Fileupload
						on:change={(e) => {
							parseFCJ(e);
							modified = true;
						}}
						accept=".json"
					/>
				</DropdownItem>
			</Dropdown>
			<Button on:click={clearSplitting}>Clear</Button>
			<Toggle bind:checked={compFlight}>{compFlight ? 'Competition' : 'Training'}</Toggle>
	</div>
	<div class="manSelect">
		<strong>Manoeuvre</strong>
		<strong>End</strong>

		{#each mans as man, i}
			{#if activeMan == i}
				<div class="cell col1">
					<button>{i}: {man.name} ▼</button>
					<Dropdown bind:open={msddOpen} on:show={loadCategories}>
						{#if i == 0}
							<DropdownItem on:click={() => setManoeuvre(i, ManSplit.TakeOff(i, man.stop))}
								>0: Takeoff</DropdownItem
							>
						{/if}
						<DropdownItem on:click={() => setManoeuvre(i, ManSplit.Break(i, man.stop))}
							>{activeMan}: break</DropdownItem
						>
						{#if i == mans.length - 1}
							<DropdownItem on:click={() => setManoeuvre(i, ManSplit.Landing(i, man.stop))}
								>{activeMan}: Landing</DropdownItem
							>
						{/if}
						{#each $categories as category}
							<DropdownItem>{category} {`\u232A`}</DropdownItem>
							<Dropdown
								placement="right-start"
								on:show={() => {
									loadSchedules(category);
								}}
							>
								{#if $schedules[category]}
									{#each $schedules[category] as schedule}
										<DropdownItem>
											{schedule}
											{`\u232A`}
										</DropdownItem>
										<Dropdown
											placement="right-start"
											on:show={() => {
												loadManoeuvres(category, schedule);
											}}
										>
											{#if $manoeuvres[`${category}_${schedule}`]}{#each $manoeuvres[`${category}_${schedule}`] as manoeuvre}
													<DropdownItem
														on:click={() =>
															setManoeuvre(i, new ManSplit(manoeuvre.name, manoeuvre.sinfo, manoeuvre.id, man.stop))}
													>
														{manoeuvre.id }: {manoeuvre.name}
													</DropdownItem>
												{/each}{/if}
										</Dropdown>
									{/each}
								{/if}
							</Dropdown>
						{/each}
					</Dropdown>
				</div>
				<div class="cell">
					{#if man.name != 'Select'}
						<button on:click={setRange}>{states[man.stop]?.time.tofixed(0) || `Update (${man.stop} -> ${range[1]})`}</button><Tooltip
							>Set the end point of this manoeuvre to the end of the active range (or press 's')</Tooltip
						>
					{/if}
				</div>
				{#if man.stop && range[1] < states.data.length && activeMan == mans.length - 1}
					<div class="cell">
						<button on:click={addMan}>+</button><Tooltip>Add Manoeuvre</Tooltip>
					</div>
				{/if}
			{:else}
				<div class="cell col1">
					<button
						on:click={() => {
							activeMan = i;
						}}>{man.name}</button
					><Tooltip>Activate Manoeuvre</Tooltip>
				</div>
				<div class="cell">{man.stop}</div>
				<div class="cell">
					<button
						on:click={() => {
							deleteMan(i);
						}}><small>X</small></button
					>
				</div>
			{/if}
		{/each}
	</div>
	<div class="maninfo">
		<strong>Category:</strong>
		<p>{mans[activeMan]?.sinfo?.category || '-'}</p>
		<strong>Schedule:</strong>
		<p>{mans[activeMan]?.sinfo?.name || '-'}</p>
		<strong>Manoeuvre:</strong>
		<p>{mans[activeMan]?.name}</p>
	</div>
</div>

<svelte:window
	on:keydown={(e) => {
		keyPress(e.key);
	}}
/>

<style>
	strong {
		justify-self: center;
	}
	small {
		font-size: medium;
		color: darkgray;
	}
	.parent {
		height: 100%;
		display: grid;
		grid-template-columns: 4fr 1fr;
		grid-template-rows: min-content 1fr min-content;
		gap: 1em;
	}
	.plot {
		grid-row: 1/4;
	}
	.manSelect {
		display: grid;
		grid-template-columns: 2fr 2fr 1fr;
		grid-gap: 0px;
		grid-auto-rows: min-content;
	}
	.options {
		grid-column: 2;
	}
	button {
		white-space: nowrap;
		display: inline-block;
	}

	.cell {
		align-content: stretch;
		font-size: medium;
		justify-self: center;
		margin-right: 2px;
		margin-left: 2px;
	}

	.col1 {
		grid-column: 1;
	}

	.maninfo {
		grid-column: 2;
		grid-row: 3;
		display: grid;
		grid-template-columns: min-content max-content;
		justify-self: stretch;
	}
</style>
