<script lang="ts">

	import NumberInput from '$lib/manoeuvre/special_inputs/NumberInput.svelte';
	import * as inputs from '$lib/manoeuvre/special_inputs/inputs';
	import ArrayInput from '$lib/manoeuvre/special_inputs/ArrayInput.svelte';
	import type { ManBuilder } from '$lib/manoeuvre/builder.svelte';
	import { Combination } from '$lib/manoeuvre/aresti.svelte';
	import { ssrModuleExportsKey } from 'vite/module-runner';

	let {
		newCombos = $bindable(),
		oldCombos,
    builder,
		canEdit,
		onchange = () => {}
	}: {
		newCombos: Record<string, Combination>;
		oldCombos: Record<string, Combination>;
    builder: ManBuilder;
		canEdit?: boolean;
		onchange?: (newParms: Record<string, Combination>) => void;
	} = $props();


//	let comboDefaults: Record<string, number> = $state(objmap(combinations, (v) => 0));
	let newComboName = $state('NewName');
</script>


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

	{#each Object.keys(newCombos) as k, ik}
		<tbody>
			{#each newCombos[k].desired as v, i}
				<tr>
					<td class="text-start overflow-hidden">{i == 0 ? k : ''}</td>

					<td>
						<input
							class="form-check-input"
							type="radio"
							name="combo{k}"
							id="{k}{i}"
							value={i}
							bind:group={newCombos[k].active}
						/>
						<label class="form-check-label small" for="{k}{i}">
							Option {String.fromCharCode(65 + i)}
						</label>
					</td>

					<ArrayInput
						value={v}
						refvalue={oldCombos[k] ? oldCombos[k].desired[i] : undefined}
						input={new inputs.RollInput('Enter combination options')}
						{canEdit}
						onchange={(newval) => {
							newCombos[k].desired[i] = newval as number[];
							onchange(newCombos);
						}}
					/>
				</tr>
			{/each}
			<tr>
				<td class="p-0"
					><button
						class="btn btn-sm btn-outline-secondary w-100"
						onclick={() => {
							delete newCombos[k];
							onchange(newCombos);
						}}
					>
						Delete {k}
					</button></td
				>
				<td class="p-0">
					<button
						class="btn btn-sm btn-outline-secondary w-100"
						onclick={() => {
              newCombos[k].desired.push([0]);
							onchange(newCombos);
						}}
					>
						Add Option
					</button>
				</td>
				<td class="p-0">
					<button
						class="btn btn-sm btn-outline-secondary w-100"
						onclick={() => {
							if (newCombos[k].desired.length > 1) {
								newCombos[k].desired.pop();
								onchange(newCombos);
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
						const all_parms = [...Object.keys(newCombos), ...Object.keys(builder.parameters)];
            console.log(all_parms);
            while (
							all_parms.includes(
								`${comboName}${suffix || ""}`
							)
						) {
							suffix = suffix + 1;
						}
						
						newCombos[`${comboName}${suffix|| ""}`] = new Combination([]);
						onchange(newCombos);
						
					}}
				>
					Create Parameter
				</button>
			</td>
		</tr>
	</tbody>
</table>
