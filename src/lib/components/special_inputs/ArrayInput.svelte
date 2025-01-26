<script lang="ts">
	import * as inputs from '$lib/components/special_inputs/inputs';
	import type { ManParm } from '$lib/schedules/mandef';
	import MpNumberInput from './MPNumberInput.svelte';
	import NumberInput from './NumberInput.svelte';
	import { type CombinationValue, type ComparisonValue } from '$lib/schedules/aresti';
	let {
		value = $bindable(),
		refvalue = $bindable(),
		input,
		canEdit = false,
		mps,
    ndmps,
		onchange = () => {}
	}: {
		value: (number | string)[];
		refvalue: (number | string)[] | undefined;
		input: inputs.RollInput;
		canEdit?: boolean;
		mps: Record<string, ManParm> | undefined;
    ndmps: Record<string, CombinationValue | ComparisonValue>;
		onchange?: (newVal: number | string | (number | string)[]) => void;
	} = $props();
  
  const hasChanged = $derived(inputs.equals(value, refvalue) ? '' : 'table-warning')

</script>

<td class="p-0 {hasChanged}" colspan="2">
	<div class="dropdown">
		<button
			type="button"
			class="w-100 btn btn-sm btn-outline-secondary dropdown-toggle"
			data-bs-toggle="dropdown"
			aria-expanded="false"
			data-bs-auto-close="outside"
		>
			{input.formatArg(value)}
		</button>
		<form class="dropdown-menu p-0" >
			<table class="table table-sm table-borderless w-100">
				<tbody>
					{#each value as v, i}
						<tr>
              {#if mps}
              <MpNumberInput
								bind:value={value[i]}
                refvalue={refvalue ? refvalue[i] : undefined}
								numInput={new inputs.NumberInput('rad', Math.PI / 4)}
								{canEdit}
								{mps}
                {ndmps}
							/>
              {:else}
              <NumberInput 
                bind:value={value[i] as number}
                refvalue={refvalue ? refvalue[i] as number : undefined}
                numInput={new inputs.NumberInput('rad', Math.PI / 4)}
                {canEdit}
                />
              {/if}
            </tr>
					{/each}
          <tr>
            <td colspan="3" class="p-0">
              <div class="btn-group w-100">
                <button class="btn btn-sm btn-outline-secondary"
                  onclick={() => {
                    value.pop();
                  }}
                >
                  -
                </button>
              <button
                class="btn btn-sm btn-outline-secondary"
                onclick={() => {
                  value.push(value[value.length-1] || 0);                  
                }}
              >
                +
              </button>
            </div>
            </td>
          </tr>
				</tbody>
			</table>
		</form>
	</div>
</td>
