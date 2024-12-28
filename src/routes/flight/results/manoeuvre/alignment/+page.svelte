<script lang="ts">
	import { analyses, selManID, fcj } from '$lib/stores/analysis';
	import { analyseManoeuvre } from '$lib/analysis/analysis';
	import { base } from '$app/paths';
	import PlotDTW from '$lib/components/plots/PlotDTW.svelte';
	import { MA } from '$lib/analysis/ma';

	$: man = analyses[$selManID!];

	let step: number = 0.2;

	$: elements = $man?.flown?.element;
	$: end_info = $man?.flown?.end_info();

	let element: string | null = null;

	const editsplit = (stp: number, elname: string | null) => {
		if (elname == null) return;
		const elindex = elements!.lastIndexOf(elname);
		let i = 0;
		if (stp > 0) {
			const endt = Math.min(
				end_info[elname].lastt + stp,
				end_info[elements![elindex + 1]].lastt - 0.1
			);
			while ($man!.flown!.data[end_info[elements![elindex]].lastid + i].t < endt) {
				$man!.flown!.data[end_info[elements![elindex]].lastid + i].element = elname;
				i++;
			}
		} else {
			const endt = Math.max(end_info[elname].lastt + stp, end_info[elname].firstt + 0.1);
			while ($man!.flown!.data[end_info[elements![elindex]].lastid - i].t > endt) {
				$man!.flown!.data[end_info[elements![elindex]].lastid - i].element = elements![elindex + 1];
				i++;
			}
		}
		let history = $man!.history;
		$man = new MA(
			$man!.name,
			$man!.id,
			$man!.tStart,
			$man!.tStop,
			$man!.schedule,
			$man!.scheduleDirection,
			history,
			$man!.k,
			$man!.flown,
			$man!.mdef
		);
	};

	$: states = $man!.flown!.split();
</script>

<div class="col-12 border">
	<PlotDTW sts={states} bind:activeEl={element} sp={3} />

	<nav class="navbar fixed-bottom ">
		<div class="container-fluid ">
			<div class="row w-100 justify-content-center">
				<select
					class="nav-item col-auto form-select"
          style="width:auto"
					title="Select element to edit (or click ribbon)"
					bind:value={element}
				>
					{#each ['Select Element'].concat(...Object.keys(states)) as el}
						<option value={el}>{el}</option>
					{/each}
				</select>
				<input
					title="Enter step size in seconds"
					class="nav-item col-auto form-control text-center"
          style="width: 100px;"
					type="number"
					id="stepsize"
					bind:value={step}
					step="0.1"
				/>
        <div class="col-auto btn-group p-0">
				<button
					class="btn btn-outline-secondary"
					title="Adjust split location backwards"
					on:click={() => {
						editsplit(-Number(step), element);
					}}>&#60</button
				>
				<button
					class="btn btn-outline-secondary"
					title="Adjust split location forwards"
					on:click={() => {
						editsplit(Number(step), element);
					}}>&#62</button
				>
      </div>
      <div class="btn-group p-0 col-auto">
				<button
					class="btn btn-outline-secondary"
					title="Run aligment optimisation"
					on:click={() => {
						analyseManoeuvre($selManID, true, true);
					}}>Optimise</button
				>
				<button
					class="btn btn-outline-secondary"
					title="Recalculate score without optimisation"
					on:click={() => {
						analyseManoeuvre($selManID, true, false);
					}}>Score</button
				>
      </div>
			</div>
		</div>
	</nav>
</div>
