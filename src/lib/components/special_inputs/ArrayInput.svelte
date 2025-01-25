<script lang="ts">
	import { NumberInput, type RollInput, equals } from '$lib/components/special_inputs/inputs';
	import type { ManParm } from '$lib/schedules/mandef';
	import MpNumberInput from './MPNumberInput.svelte';
	
	let {
		value = $bindable(),
		refvalue = $bindable(),
		input,
		canEdit = false,
		mps,
		onchange = () => {}
	}: {
		value: (number | string)[];
		refvalue: (number | string)[];
		input: RollInput;
		canEdit?: boolean;
		mps: Record<string, ManParm>;
		onchange?: (newVal: number | string | (number | string)[]) => void;
	} = $props();
  
  const hasChanged = $derived(equals(value, refvalue) ? '' : 'table-warning')
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
		<form class="dropdown-menu p-0" style="width: 400px;">
			<table class="table table-sm table-borderless w-100">
				<tbody>
					{#each value as v, i}
						<tr
							><MpNumberInput
								bind:value={value[i]}
                bind:refvalue={refvalue[i]}
								numInput={new NumberInput('rad', Math.PI / 4)}
								{canEdit}
								{mps}
							/></tr
						>
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
