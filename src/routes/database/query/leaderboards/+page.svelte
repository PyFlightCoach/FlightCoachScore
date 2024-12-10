<script lang="ts">
	import DbTable from "$lib/components/leaderboards/DBTable.svelte";
  import { table_rows, lastResponse } from '$lib/stores/leaderboards';
  
</script>


<DbTable bind:lastResponse={$lastResponse} bind:table_rows={$table_rows}/>

