<script lang="ts">
	import DbTable from '$lib/components/leaderboards/DBTable.svelte';
	import LeaderQuery from '$lib/components/leaderboards/LeaderQuery.svelte';
	import { table_rows, lastResponse } from '$lib/stores/leaderboards';
  import navBarContents from "$lib/stores/navBarContents";
  import DBMenu from './DBMenu.svelte';
  $navBarContents = DBMenu;

	export let data;
	
</script>

<div class="col-md-4 col-lg-3 col-xl-2 mb-2">
	<LeaderQuery fa_versions={data.fa_versions} bind:lastResponse={$lastResponse} bind:table_rows={$table_rows} />
</div>

<div class="col-md-8 col-lg-9 col-xl-10 align-self-start">
	<slot />

</div>