<script lang="ts">
	import { analyses, selManID } from '$lib/stores/analysis';
	import { analyseManoeuvre } from '$lib/flight/analysis';
	import { isFullSize } from '$lib/stores/shared';
	import PlotDTW from '$lib/plots/PlotDTW.svelte';
	import { loadManDef, library } from '$lib/schedule/library';
	import { States } from '$lib/utils/state';
	import { GlobalState } from '$lib/flight/flight';
	import { ManOpt } from '$lib/manoeuvre/definition.svelte';

	let step: number = $state(0.2);
	let element: string | undefined = $state();

	const man = $derived(analyses[$selManID!]);
	let flown = $state(States.parse(structuredClone($man!.flown.data)));
	const elements = $derived(flown.element);
	const end_info = $derived(flown.end_info());
	let states = $derived(flown.split());

	let selectedOption = $state($man?.activeOption());
	$inspect(selectedOption);
	const editsplit = (stp: number, elname: string | undefined) => {
		if (elname == null) return;
		let data = flown.data;
		const elindex: number = elements!.lastIndexOf(elname);
		const ename: string = elements![elindex]!;
		let i = 0;
		if (stp > 0) {
			const endt = Math.min(
				end_info[elname].lastt + stp,
				end_info[elements![elindex + 1] as string].lastt - 0.1
			);
			while (data[(end_info[ename].lastid + i) as number].t < endt) {
				data[end_info[ename].lastid + i].element = ename;
				i++;
			}
		} else {
			const endt = Math.max(end_info[elname].lastt + stp, end_info[elname].firstt + 0.1);
			while (data[end_info[ename].lastid - i].t > endt) {
				data[end_info[ename].lastid - i].element = elements![elindex + 1];
				i++;
			}
		}
		flown = new States(data);
	};

	async function run(force: boolean, optimise: boolean, reset: boolean) {
		const md = reset
			? await loadManDef(
					$library.subset({
						category_name: $man!.schedule.category,
						schedule_name: $man!.schedule.name
					}).first!.manoeuvres[$man!.id - 1].id
				)
			: $man!.mdef;
		$man = Object.assign($man!, { data: new GlobalState(flown, $man?.data.origin!), mdef: md });
		analyseManoeuvre($selManID!, force, optimise, reset);
	}
</script>

<div class="container-fluid d-flex flex-column h-100 justify-content-around">
	<div class="col-auto"></div>
	<div class="col">
		<PlotDTW bind:sts={states} bind:activeEl={element} scale={$isFullSize ? 3 : 1.5} expand={30} />
	</div>

	<div class="col-auto">
		<div class="container-auto d-flex flex-row justify-content-center">
			<div class="row">
				<div class="input-group">
					<select
						class="form-select"
						style="max-width:150px;"
						title="Select element to edit (or click ribbon)"
						bind:value={element}
					>
						{#each ['Element'].concat(...Object.keys(states)) as el, i}
							<option value={el}>{$man?.mdef?.eds[el]?.describe || el}</option>
						{/each}
					</select>
					<button
						class="btn btn-outline-secondary"
						title="Adjust split location backwards"
						onclick={() => {
							editsplit(-Number(step), element);
						}}>&#60</button
					>
					<input
						title="Enter step size in seconds"
						class=" form-control text-center"
						style="max-width:70px;"
						type="number"
						id="stepsize"
						bind:value={step}
						step="0.1"
					/>
					<button
						class="btn btn-outline-secondary"
						title="Adjust split location forwards"
						onclick={() => {
							editsplit(Number(step), element);
						}}>&#62</button
					>
					<div class=" btn-group p-0 dropup">
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
								<div class="dropdown-item">
									<label for="selectOption">Select Option:</label>
									<select
										id="selectOption"
										class="form-select"
										size="3"
										bind:value={selectedOption}
									>
										{#if $man!.allOptions.length > 1}
											<option value={undefined}> Auto </option>
										{/if}
										{#each $man?.allOptions as _, i}
											<option title="Select option {i}" value={i}>
												Option {i}
											</option>
										{/each}
									</select>
								</div>
								<button
									class="dropdown-item"
									title="Rerun analysis from scratch with the selected option"
									onclick={() => {
										$man = $man!.selectOption(selectedOption);
                    analyseManoeuvre($selManID!, true, true, false);
									}}>Rerun</button
								>

								<div class="dropdown-divider"></div>

								<button
									class="dropdown-item"
									title="Recalculate score without optimisation"
									onclick={() => {
										run(true, false, false);
									}}>Score</button
								>
								<button
									class="dropdown-item"
									title="Run aligment optimisation from current segmentation"
									onclick={() => {
										run(true, true, false);
									}}>Optimise</button
								>

								<button
									class="dropdown-item"
									title="Reset the segmentation changes made in this session"
									onclick={() => {
										flown = States.parse(structuredClone($man!.flown.data));
									}}>Reset</button
								>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
