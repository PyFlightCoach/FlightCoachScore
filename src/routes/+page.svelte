<script lang="ts">
	import { user } from '$lib/stores/user';
	import About from './About.svelte';
	import UserActivity from '../lib/database/UserActivity.svelte';
	import RecentFlights from '$lib/database/RecentFlights.svelte';
	import TopFlights from '$lib/database/TopFlights.svelte';
	import { loadActivity, loadRecent, loadTopFlights } from '$lib/database/userActivity';
	import { dbServer } from '$lib/api';
	import type { UserActivityResponse, TopFlightsResponse } from '$lib/database/userActivity';
	import type { DBFlightRanked } from '$lib/api/DBInterfaces/flight';

	let activeNews = $state(0);
	let show = $state('About');
	const getNews = $derived(
		$user
			? dbServer.get('news').then((res) => {
					show = 'News';
					activeNews = 0;
					return res.data.results;
				})
			: []
	);

	let tableShow = $state('last20');

	let userActivity: UserActivityResponse[] | undefined = $state();
	let recent: DBFlightRanked[] | undefined = $state();
	let topFlights: TopFlightsResponse[] | undefined = $state();
    
	$effect(() => {
		if ($user) {
			loadActivity().then((data) => (userActivity = data));
			loadRecent().then((data) => (recent = data));
			loadTopFlights(3).then((data) => (topFlights = data));
		}
	});
</script>

<div class="row ps-4 w-100">
	<div class="col-lg-{$user ? '6' : '10'} col-auto">
		<div class="row mb-3">
			<h1 class="text-center pt-3 h-1">Flight Coach Score</h1>
			<lead class="lead text-center text-muted"
				>Automatic judging and score sharing for precision aerobatics</lead
			>
		</div>
		<hr />
		{#await getNews then news}
			{#if $user && news.length}
				<div class="button-grp-sm mb-2">
					<input type="radio" class="btn-check" value="About" id="about" bind:group={show} />
					<label class="btn btn-outline-secondary btn-sm" for="about">About</label>

					<input type="radio" class="btn-check" value="News" id="news" bind:group={show} />
					<label class="btn btn-outline-secondary btn-sm" for="news">News</label>
				</div>

				{#if show == 'News'}
					<div class="row bg-light rounded border p-1">
						<div class="row pt-1 d-flex">
							<small class="col-auto"
								>{#if activeNews == 0}Latest{/if} News</small
							>
							<h3 class="col text-center">{news[activeNews].headline}</h3>
							<small class="col-auto text-body-secondary">{news[activeNews].updated_when}</small>
						</div>
						<div class="row overflow-auto px-3">
							{@html news[activeNews].body}
						</div>
						<div class="row d-flex flex-row justify-content-between">
							<button
								class="btn btn-link col-auto link"
								disabled={activeNews == news.length - 1}
								onclick={() => {
									activeNews = Math.min(news.length - 1, activeNews + 1);
								}}>previous</button
							>
							<button
								class="btn btn-link col-auto"
								disabled={activeNews == 0}
								onclick={() => {
									activeNews = Math.max(0, activeNews - 1);
								}}>next</button
							>
						</div>
					</div>
					<hr />
				{/if}
			{/if}
			{#if show == 'About' || news.length == 0}
				<div class=" overflow-auto">
					<About />
				</div>
				<hr />
			{/if}
		{/await}
	</div>
	{#if $user}
		<div class="col-lg-6 justify-content-center px-lg-2 px-0">
      <div class="row justify-content-center py-0">
			<div class="col-auto btn-group mb-2 text-center py-2 py-0">
        <button class="btn btn-sm btn-outline-secondary {tableShow=='userActivity' ? 'active' : ''}" onclick={()=>{tableShow='userActivity'}}>User Activity</button>
        <button class="btn btn-sm btn-outline-secondary {tableShow=='last20' ? 'active' : ''}" onclick={()=>{tableShow='last20'}}>Recent Flights</button>
        <button class="btn btn-sm btn-outline-secondary {tableShow=='topFlights' ? 'active' : ''}" onclick={()=>{tableShow='topFlights'}}>Top Flights</button>
			</div>
      </div>
			{#if tableShow == 'userActivity'}
				<UserActivity bind:activity={userActivity} />
			{:else if tableShow == 'last20'}
				<RecentFlights bind:flightlist={recent} />
			{:else if tableShow == 'topFlights'}
				<TopFlights bind:topflights={topFlights} />
			{/if}
		</div>
	{/if}
</div>
