<script lang="ts">
	import { max } from '$lib/utils/arrays';
	import { d3Colors, colscale, redsColors } from '$lib/components/plots/styling';
  import {createEventDispatcher} from 'svelte';

  const dispatch = createEventDispatcher();

	export let data: Record<string, Record<string, number>>;
	export let activeRow: null | string = null;
	export let activeCol: null | string = null;
	export let colorCols: null | string[] = null;
	export let colours = redsColors;

	$: rowNames = Object.keys(data);
	$: colNames = Object.keys(data[rowNames[0]]);
	$: colCols = colorCols == null ? colNames : colorCols;

	$: maxVal = max(Object.values(data).map((s) => max(colCols.map((k) => s[k]))));

	const activateCell = (row: string | null, col: string | null) => {
		if (row == null || col == null) {
			activeRow = row;
			activeCol = col;
		} else if (data[row][col] != null) {
			activeRow = row;
			activeCol = col;
		}
    dispatch('select', {row, col});
	};

	const getColor = (row: string, col: string) => {
		if (colCols.indexOf(col) >= 0) {
			return colscale(data[row][col], maxVal, colours);
		} else {
			return 'white';
		}
	};
</script>

<div class="table-responsive">
	<table class="table table-sm table-hover table-bordered border-primary text-center ">
		<thead>
			<tr>
				<th role="button" class="text-center" on:click={() => activateCell(null, null)}
					>Clear Selection</th
				>
				{#each colNames as col}
					<th class="table-rotated-header text-end align-middle" class:active={col == activeCol}
						>{col.replace('_', ' ')}</th
					>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each rowNames as row}
				<tr>
					<td
						role="button"
						on:click={(e) => {
							activateCell(row, null);
						}}
						class:active={row == activeRow}
						style:background-color={d3Colors[rowNames.indexOf(row) % d3Colors.length]}
					>
						{row}
					</td>

					{#each colNames as col}
						{#if data[row][col] != null}
							<td
								role="button"
								class:active={row == activeRow && col == activeCol}
								on:click={(e) => {
									activateCell(row, col);
								}}
								style:background-color={getColor(row, col)}
							>
								{data[row][col].toFixed(2)}
							</td>
						{:else}
							<td class="text-center">-</td>
						{/if}
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	th:first-child,
	td:first-child {
		position: sticky;
		left: 0px;
		background-color: grey;
	}

  .table-rotated-header {
      writing-mode: vertical-lr; 
  }
</style>
