<script lang="ts">
	import DbTable from "$lib/leaderboards/DBTable.svelte";
  import { table_rows, lastResponse } from '$lib/leaderboards/stores';
  
</script>


<DbTable bind:lastResponse={$lastResponse} bind:table_rows={$table_rows}/>

