<script lang="ts">
	import { PE } from '$lib/manoeuvre/aresti.svelte';
	import type { ManBuilder } from '$lib/manoeuvre/builder.svelte';
	import type { MPValue } from '$lib/manoeuvre/definition.svelte';
	import ValueInput from '$lib/manoeuvre/special_inputs/ValueInput.svelte';
  import * as inputs from '$lib/manoeuvre/special_inputs/inputs';

	const {
		pe = $bindable(),
		refpe,
		builder,
		canEdit = false,
    mpValues,
    isCentreManoeuvre = false,
		onchange = () => {}
	}: {
		pe: PE;
		refpe: PE | undefined;
		builder: ManBuilder;
		canEdit?: boolean;
    mpValues: Record<string, MPValue>;
    isCentreManoeuvre?: boolean;
		onchange?: (newpe: PE) => void;
	} = $props();

	const elbuilder = $derived(builder.element_builders[pe.kind]);
  let allkwargs = $derived({...elbuilder.kwargs, ...pe.kwargs});

</script>

<hr />
{#if isCentreManoeuvre}
<div class="row">
  <div class="col">
  <div class="form-check">
    <input class="form-check-input" type="checkbox" id="centred" bind:checked={pe.centred} disabled={!canEdit} />
    <label  for="centred">Centred</label>
  </div>
</div>
</div>
{/if}
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
          {mpValues}
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
          {mpValues}
          onchange={(newval) => {
            if (newval != elbuilder.kwargs[k] && newval) {
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
