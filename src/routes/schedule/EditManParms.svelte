<script lang="ts">
	import { ManParm } from '$lib/manoeuvre/definition.svelte';
	import type { ManBuilder } from '$lib/schedule/builder.svelte';
	import { builder } from '$lib/schedule/builder.svelte';
	import NumberInput from '$lib/components/special_inputs/NumberInput.svelte';
	import * as inputs from '$lib/components/special_inputs/inputs';
	import ArrayInput from '$lib/components/special_inputs/ArrayInput.svelte';
	import { objmap } from '$lib/utils/arrays';
  import {extractComboNdMps} from '$lib/schedule/aresti.svelte';

	let {
		newParms = $bindable(),
		oldParms,
		canEdit = $bindable(),
    comboDefaults = $bindable(),
		onchange = () => {}
	}: {
		newParms: Record<string, number | number[][]>;
		oldParms: Record<string, number | number[][]>;
		canEdit?: boolean;
    comboDefaults: Record<string, number>;
		onchange?: (newParms: Record<string, number | number[][]>) => void;
	} = $props();

	const comparisons: Record<string, number> = $derived(
		Object.fromEntries(
			Object.entries($builder!.comparisonValues).map(([k, v]) => [k, (newParms[k] || v) as number])
		)
	);

	const combinations: Record<string, number[][]> = $derived(extractComboNdMps(newParms));

//	let comboDefaults: Record<string, number> = $state(objmap(combinations, (v) => 0));
	let newComboName = $state('NewName');
</script>

<table class="table table-sm table-borderless">
	<tbody>
		<tr><td colspan="4"><small>Comparison Parameters</small></td></tr>
		{#each Object.keys(comparisons) as k}
			<tr class={comparisons[k] != $builder?.comparisonValues[k] ? 'table-active' : ''}>
				<td colspan="2" class="text-start overflow-hidden" style="max-width:150px">{k}</td>
				<NumberInput
					value={comparisons[k]}
					refvalue={(oldParms[k] || $builder!.parameters[k].defaul) as number | undefined}
					numInput={inputs.inputMap[k as keyof typeof inputs.inputMap] as inputs.NumberInput}
					{canEdit}
					onchange={(newval) => {
						newParms[k] = newval;
						onchange(newParms);
					}}
				/>
			</tr>
		{/each}
	</tbody>
</table>

<table class="table table-sm table-borderless">
	<thead>
		<tr>
			<th scope="col" class="col-auto"></th>
			<th scope="col" class="col-auto"></th>
			<th scope="col" colspan="2" class="col-6"></th>
		</tr>
	</thead>
	<tbody>
		<tr><td colspan="5"><small>Combination Parameters</small></td></tr>
	</tbody>

	{#each Object.keys(combinations) as k, ik}
		<tbody>
			{#each combinations[k] as v, i}
				<tr>
					<td class="text-start overflow-hidden">{i == 0 ? k : ''}</td>

					<td>
						<input
							class="form-check-input"
							type="radio"
							name="combo{k}"
							id="{k}{i}"
							value={i}
							bind:group={comboDefaults[k]}
						/>
						<label class="form-check-label small" for="{k}{i}">
							Option {String.fromCharCode(65 + i)}
						</label>
					</td>

					<ArrayInput
						value={v}
						refvalue={oldParms[k] ? (oldParms[k] as number[][])[i] : undefined}
						input={new inputs.RollInput('Enter combination options')}
						{canEdit}
						onchange={(newval) => {
							newParms[k][i] = newval;
							onchange(newParms);
						}}
					/>
				</tr>
			{/each}
			<tr>
				<td class="p-0"
					><button
						class="btn btn-sm btn-outline-secondary w-100"
						onclick={() => {
							delete newParms[k];
							onchange(newParms);
						}}
					>
						Delete {k}
					</button></td
				>
				<td class="p-0">
					<button
						class="btn btn-sm btn-outline-secondary w-100"
						onclick={() => {
							(newParms[k] as number[][]).push([0]);
							onchange(newParms);
						}}
					>
						Add Option
					</button>
				</td>
				<td class="p-0">
					<button
						class="btn btn-sm btn-outline-secondary w-100"
						onclick={() => {
							if (newParms[k].length > 1) {
								(newParms[k] as number[][]).pop();
								onchange(newParms);
							}
						}}
					>
						Delete Last Option
					</button>
				</td>
			</tr>
		</tbody>
	{/each}
	<tbody >
		<tr>
			<td class="p-0"
				><input class="form-control form-control-sm" type="text" bind:value={newComboName} /></td
			>
			<td colspan="3" class="p-0">
				<button
					class="btn btn-sm btn-outline-secondary w-100"
					onclick={() => {
						const comboName = newComboName.replaceAll(' ', '_');
						let suffix = 0;
						const all_parms = [...Object.keys(newParms), ...Object.keys($builder!.parameters)];
            console.log(all_parms);
            while (
							all_parms.includes(
								`${comboName}${suffix || ""}`
							)
						) {
							suffix = suffix + 1;
						}
						
						newParms[`${comboName}${suffix|| ""}`] = [[0]];
						onchange(newParms);
						comboDefaults[`${comboName}${suffix|| ""}`] = 0;
					}}
				>
					Create Parameter
				</button>
			</td>
		</tr>
	</tbody>
</table>
