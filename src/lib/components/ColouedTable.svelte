<script lang="ts">
  import { max  } from '$lib/utils/arrays';
  import {d3Colors, colscale, redsColors} from '$lib/components/plots/styling';

	export let data: Record<string, Record<string, number>>;
  export let activeRow: null|string = null;
  export let activeCol: null|string = null;
  export let colorCols: null|string[] = null;
  export let colours = redsColors;

  $: rowNames = Object.keys(data);
  $: colNames = Object.keys(data[rowNames[0]]);
  $: colCols = colorCols == null ? colNames : colorCols;

  $: maxVal=max(Object.values(data).map(s=>max(colCols.map(k=>s[k]))));


  const activateCell = (row: string|null, col: string|null) => {

    if (row == null || col == null) {
      activeRow = row;
      activeCol = col;
    } else if (data[row][col] != null) {
      activeRow = row;
      activeCol = col;
    }
    
  }

  const getColor = (row: string, col: string) => {
    if (colCols.indexOf(col) >= 0) {
      return colscale(data[row][col], maxVal, colours)
    } else {
      return 'white'
    } 
  }
</script>


<table class='table table-sm table-hover'>
  <thead>
    <tr>
      <th on:click={()=>activateCell(null, null)}>Clear Selection</th>
      {#each colNames as col}
        <th class:active={col==activeCol}>{col}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    
      {#each rowNames as row} 
      <tr>
      <td
          on:click={(e)=>{activateCell(row, null);}} 
          class:active={row==activeRow}
          style:background-color={d3Colors[rowNames.indexOf(row)% d3Colors.length]}
         >
        {row}
      </td>  
      
      {#each colNames as col}
        <td
          class:active={row==activeRow && col==activeCol}
          on:click={(e)=>{activateCell(row, col);}}
          style:background-color={getColor(row, col)}
        >
          {#if data[row][col] != null}
            {data[row][col].toFixed(2)}
          {:else}
            -
          {/if}
        </td>
      {/each}
    </tr>
      {/each}  
    
  </tbody>
  

</table>

