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

	<nav class="navbar fixed-bottom">
		<div class="container-fluid justify-content-md-center">
			<div class="row">
				<div class="col">
					<ul class="navbar-nav me-auto mb-2 mb-lg-0">
						<div class="input-group">
							<select
								class="form-control-sm form-select"
								title="Select element to edit or click ribbon"
								bind:value={element}
							>
								{#each ['Select Element'].concat(...Object.keys(states)) as el}
									<option value={el}>{el}</option>
								{/each}
							</select>
							<input
								title="Enter step size in seconds"
								class="form-control-sm"
								type="number"
								id="stepsize"
								bind:value={step}
								step="0.1"
							/>
							<button
								class="form-control-sm btn btn-outline-secondary"
								title="Adjust split location backwards"
								on:click={() => {
									editsplit(-Number(step), element);
								}}>&#60</button
							>
							<button
								class="form-control-sm btn btn-outline-secondary"
								title="Adjust split location forwards"
								on:click={() => {
									editsplit(Number(step), element);
								}}>&#62</button
							>
							<button
								class="form-control-sm btn btn-outline-secondary"
								title="Run aligment optimisation"
								on:click={() => {
									analyseManoeuvre($selManID, true, true);
								}}>Optimise</button
							>
							<button
								class="form-control-sm btn btn-outline-secondary"
								title="Recalculate score without optimisation"
								on:click={() => {
									analyseManoeuvre($selManID, true, false);
								}}>Score</button
							>
						</div>
					</ul>
				</div>
			</div>
		</div>
	</nav>
</div>
