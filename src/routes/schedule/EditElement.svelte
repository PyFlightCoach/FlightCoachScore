<script lang="ts">
	import { PE } from '$lib/schedules/aresti.svelte';
	import type { ManBuilder } from '$lib/schedules/builder.svelte';
	import ValueInput from '$lib/components/special_inputs/ValueInput.svelte';
  import * as inputs from '$lib/components/special_inputs/inputs';

	const {
		pe = $bindable(),
		refpe,
		builder,
		canEdit = false,
    ndmps,
		onchange = () => {}
	}: {
		pe: PE;
		refpe: PE | undefined;
		builder: ManBuilder;
		canEdit?: boolean;
    ndmps: Record<string, number[][]>;
		onchange?: (newpe: PE) => void;
	} = $props();

	const elbuilder = $derived(builder.element_builders[pe.kind]);
  let allkwargs = $derived({...elbuilder.kwargs, ...pe.kwargs});

</script>

<hr />
<table class="table table-sm table-borderless">
	<tbody>
		<tr><td colspan="4"><small>Required Parameters</small></td></tr>
		{#each elbuilder.args as arg, i}
			<tr>
				<ValueInput
					name={arg as keyof typeof inputs.inputMap}
					bind:value={pe.args[i]}
					refvalue={refpe?.args[i]}
					{canEdit}
					mps={builder.parameters}
          {ndmps}
				/>
			</tr>
		{/each}
		<tr><td colspan="4"><small>Optional Parameters</small></td></tr>
		{#each Object.entries(elbuilder.kwargs) as [k, v]}
			<tr class={Object.keys(pe.kwargs).includes(k) ? 'table-active' : ''}>
				<ValueInput
					name={k as keyof typeof inputs.inputMap}
					bind:value={allkwargs[k]}
					refvalue={refpe?.kwargs[k] == undefined ? elbuilder.kwargs[k] : refpe.kwargs[k] }
					{canEdit}
					mps={builder.parameters}
          {ndmps}
          onchange={(newval) => {
            if (newval != elbuilder.kwargs[k]) {
              pe.kwargs[k] = newval;
            } else {
              delete pe.kwargs[k];
            }            
          }}
				/>
			</tr>
		{/each}
	</tbody>
</table>
