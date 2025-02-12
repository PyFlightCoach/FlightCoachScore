<script lang="ts">
	import { analyses, selManID, fcj } from '$lib/stores/analysis';
	import { analyseManoeuvre } from '$lib/flight/analysis';
  import {isFullSize} from '$lib/stores/shared';
	import PlotDTW from '$lib/plots/PlotDTW.svelte';
  import { loadManDef, library } from '$lib/schedule/library';

	$: man = analyses[$selManID!];

	let step: number = 0.2;

	$: elements = $man?.flown?.element;
	$: end_info = $man?.flown?.end_info();

	let element: string | undefined;

	const editsplit = (stp: number, elname: string | undefined) => {
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

		$man!.reset();
	};

	$: states = $man!.flown!.split();
</script>

<div class="col-12 border">
	<PlotDTW sts={states} bind:activeEl={element} scale={$isFullSize ? 3 : 1.5} expand={30}/>

	<nav class="navbar fixed-bottom ">
		<div class="container-fluid ">
			<div class="row w-100 justify-content-center">
				<select
					class="nav-item col-auto form-select"
          style="width:auto"
					title="Select element to edit (or click ribbon)"
					bind:value={element}
				>
					{#each ['Select Element'].concat(...Object.keys(states)) as el, i}
						<option value={el}>{$man?.mdef?.eds[el]?.describe || el}</option>
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
						if ($selManID) analyseManoeuvre($selManID, true, true);
					}}>Optimise</button
				>
				<button
					class="btn btn-outline-secondary"
					title="Recalculate score without optimisation"
					on:click={() => {
						if ($selManID) analyseManoeuvre($selManID, true, false);
					}}>Score</button
				>
        <button
          class="btn btn-outline-secondary"
          title="Rerun the analysis from scratch, inluding the initial DTW alignment"
          on:click={() => {
            if ($selManID) loadManDef(
              $library.subset({
                category_name: $man!.schedule.category,
                schedule_name: $man!.schedule.name
              }).first!.manoeuvres[$man!.id - 1].id
            )
            .then((md)=>{
              $man = $man!.reset(md);
              analyseManoeuvre($selManID, true, true, true);
            });
            
             
          }}>Reset</button>

      </div>
			</div>
		</div>
	</nav>
</div>
