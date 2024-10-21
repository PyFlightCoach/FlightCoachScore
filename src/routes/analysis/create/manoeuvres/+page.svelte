<script lang="ts">
	//import PlotSec from '$lib/plots/PlotSec.svelte';
	import PlotSec from '$lib/components/plots/PlotSec.svelte';
	import { ManDetails, ManSplit, parseFCJMans } from '$lib/analysis/splitting';
	import type { States } from '$lib/analysis/state';
	import { FCJson } from '$lib/analysis/fcjson';
	import {
		categories,
		schedules,
		manoeuvres,
		loadCategories,
		loadSchedules,
		loadManoeuvres,
		fcj
	} from '$lib/stores/analysis';

	export let data;

	let files: FileList | undefined;

	let range: number[] = [0, data.states.data.length];
	let mans: ManSplit[] = [ManSplit.TakeOff()];
	let compFlight: boolean = false;
	let modified: boolean = false;
	let activeMan = 0;
	let msddOpen = false;
	let stddOpen = false;

	const removeFCJ = (reason: string = 'unknown') => {
		if (fcj) {
			console.log(`Removing FCJ: ${reason}`);
			$fcj = undefined;
		}
	};

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
		msddOpen = false;
		checkComp();
		removeFCJ('manoeuvre changed');
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
		stddOpen = false;
		removeFCJ('manoeuvres cleared');
	};

	const parseFCJ = (file: File) => {
		const reader = new FileReader();
		reader.onload = () => {
			if (reader.result) {
				$fcj = FCJson.parse(JSON.parse(reader.result as string));
			}
		};
		reader.readAsText(file);
		stddOpen = false;
	};

	$: if ($fcj) {parseFCJMans($fcj, data.states).then(res=>{mans = res})}

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

	$: if (compFlight) {
		checkComp(true);
	}
</script>

<div class="col-8">
	<PlotSec flst={data.states} controls={['slider', 'rangeEndClick']} bind:range />
</div>
<div class="col-4">
	
  <div class="input-group-sm">
		<input
			class="form-control-sm"
			type="file"
			accept=".json"
			bind:files
		/>
		{#if files && files.length > 0}
			<button class="btn btn-outline-primary form-control-sm" on:click={() => parseFCJ(files[0])}
				>Load</button
			>
		{/if}
	</div>

  {#each mans as man}
    <div class="input-group-sm">
      <button
        class="btn btn-outline-primary form-control-sm"
        on:click={() => {
          activeMan = i;
          msddOpen = true;
        }}
      >
      {man.name}
      </button>
    </div>
  {/each}

</div>
