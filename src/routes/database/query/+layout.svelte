<script lang="ts">
	import DbTable from '$lib/components/leaderboards/DBTable.svelte';
	import LeaderQuery from '$lib/components/leaderboards/LeaderQuery.svelte';
	import navBarContents from '$lib/stores/navBarContents';
	import DBMenu from './DBMenu.svelte';
	import { base } from '$app/paths';
	import {updateTable} from '$lib/stores/leaderboards';
	
  export let data;
 

	$: innerWidth = 0;
	$: md = innerWidth >= 768;

  $: if (md) {
    $navBarContents = DBMenu;
  } else {
    $navBarContents = undefined;
  }
  	
</script>

<svelte:window bind:innerWidth />

<div id="sidebar" class="{!md ? 'offcanvas offcanvas-start' : 'col-md-3 '} bg-light border overflow-scroll">
	{#if !md}
		<div class="offcanvas-header">
			<h5 class="offcanvas-title" id="offcanvasExampleLabel">Search Controls</h5>
			<button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"
			></button>
		</div>
	{/if}

	<LeaderQuery fa_versions={data.fa_versions}/>

  <div class="row p-2 justify-content-end">
    <button class="w-50 btn btn-primary" on:click={updateTable} data-bs-dismiss="offcanvas">Submit</button>
  </div>
</div>

<div class="col-md-9  px-0 ">
	<slot />
</div>

{#if !md}
	<nav class="navbar fixed-bottom navbar-expand-lg bg-body-secondary">
		<div class="container-fluid justify-content-between" >
			<div class="col ">
				{#if !md}
					<a
						class="btn btn-primary"
						data-bs-toggle="offcanvas"
						href="#sidebar"
						role="button"
						aria-controls="offcanvasExample"
						aria-label="Toggle sidebar"
					>
						<i class="bi bi-list bi-lg py-2 p-1"></i>
					</a>
				{/if}
			</div>

			<a class="col nav-link" href="{base}/database/query/leaderboards" aria-label="Leaderboards">
				<span><i class="bi bi-trophy"></i></span>
			</a>
			<a class="col nav-link" href="{base}/database/query/map" aria-label="Map">
				<span><i class="bi bi-map"></i></span>
			</a>
		</div>
	</nav>
{/if}
