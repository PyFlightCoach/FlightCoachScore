<script lang="ts">
	import * as inputs from '$lib/components/special_inputs/inputs';
	import type { ManParm } from '$lib/schedules/mandef';
	import MPNumberInput from './MPNumberInput.svelte';
	import RollInput from './RollInput.svelte';

	let {
		name,
		value = $bindable(),
		refvalue,
		canEdit = false,
		mps,
		onchange = () => {}
	}: {
		name: keyof typeof inputs.inputMap;
		value: inputs.Arg;
		refvalue: inputs.Arg | undefined;
		canEdit?: boolean;
		mps: Record<string, ManParm>;
		onchange?: (newvalue: inputs.Arg) => void;
	} = $props();

	const input = $derived(inputs.inputMap[name]);

	const hasChanged = $derived(inputs.equals(value, refvalue) ? '' : 'table-warning');
</script>

<td class="text-start">{name}</td>
{#if input instanceof inputs.NumberInput}
	<MPNumberInput
		bind:value={value as string | number}
		refvalue={refvalue as string | number | undefined}
		numInput={input}
		{canEdit}
		{mps}
		{onchange}
	/>
{:else if input instanceof inputs.SelectInput}
	<td class="p-0 {hasChanged}" colspan="3"
		><select
			class="w-100 btn btn-sm form-control-sm btn-outline-secondary"
			bind:value={value as string}
			disabled={!canEdit}
			onchange={() => onchange(value)}
      title={input.description}
		>
			{#each input.options as option}
				<option value={option}>{option}</option>
			{/each}
		</select>
	</td>
{:else if input instanceof inputs.BooleanInput}
	<td class="p-0 {hasChanged}" colspan="3">
		<input
			type="checkbox"
			class="btn-check"
			id="btn-check-{name}"
			autocomplete="off"
			onchange={(e) => {
				value = (e.target as HTMLInputElement).checked;
				onchange(value);
			}}
			checked={value as boolean}
			disabled={!canEdit}
      title={input.description}
		/>
		<label class="w-100 btn btn-sm btn-outline-secondary" for="btn-check-{name}">{value}</label>
	</td>
{:else if input instanceof inputs.RollInput}
	<RollInput
		bind:value={value as number | string | (number | string)[]}
		refvalue={refvalue as number | string | (number | string)[] | undefined}
		rollInput={input}
		{canEdit}
		{mps}
		{onchange}
	/>
{:else if input instanceof inputs.RollTypeInput}
	<td class="p-0 {hasChanged}" colspan="3"
		><input
			type="text"
			class="w-100 form-control form-control-sm text-center {input.checkValue(value as string) ? '' : 'bg-warning'}"
      title={input.description}
			bind:value
			disabled={!canEdit}
      onchange={() => onchange(value)}
		/></td
	>
{:else}
	<td colspan="3">{name}({value})</td>
{/if}
