<script lang="ts">
	import navBarContents from '$lib/stores/navBarContents';
	import { base } from '$app/paths';
	import { news } from '$lib/stores/shared';
	import { user } from '$lib/stores/user';
	import About from './About.svelte';

	$navBarContents = undefined;
	let activeNews = $state(0);
	let show = $state('About');

	$effect(() => {
		show = $user && $news.length ? 'News' : 'About';
	});

	const imgs = [
		{
			img: '/images/fcs_1_results.png',
			description: 'Automatically calculated scores for an F3A P25 sequence'
		},
		{
			img: '/images/fcs_2_elements.png',
			description: 'Elements automatically identified by the FCScore judging algorithm'
		},
		{
			img: '/images/fcs_3_intra_detail.png',
			description: 'Details of one of the downgrades calculated for an element'
		},
		{
			img: '/images/fcs_4_intra_table.png',
			description: 'Breakdown of downgrades applicable to each element within a manoeuvre'
		},
		{
			img: '/images/fcs_5_rankings.png',
			description: 'Rankings of flight scores shared to the database'
		},
		{
			img: '/images/fcs_6_view_flights.png',
			description: 'View of a flight shared by another pilot'
		},
		{
			img: '/images/fcs_7_view_map.png',
			description:
				'Map visualising the number of flights submitted from each site and the maximum score achieved'
		}
	];
</script>

<div class="row justify-content-around">
	<div class="col-lg-6 px-lg-3 px-0">
		<div class="row mb-3">
			<h1 class="text-center pt-3 h-1">Flight Coach Score</h1>
			<lead class="lead text-center text-muted">Automatic judging and score sharing for precision aerobatics</lead>
		</div>
		<hr />

		{#if $user && $news.length}
			<div class="button-grp-sm mb-2">
				<input
					type="radio"
					class="btn-check"
					value="About"
					id="about"
					bind:group={show}
				/>
				<label class="btn btn-outline-secondary btn-sm" for="about">About</label>

				<input
					type="radio"
					class="btn-check"
					value="News"
					id="news"
					bind:group={show}
				/>
				<label class="btn btn-outline-secondary btn-sm" for="news">News</label>
			</div>

			{#if show == 'News'}
				<div class="row bg-light rounded border p-1">
					<div class="row pt-1 d-flex">
						<small class="col-auto"
							>{#if activeNews == 0}Latest{/if} News</small
						>
						<h3 class="col text-center">{$news[activeNews].headline}</h3>
						<small class="col-auto text-body-secondary">{$news[activeNews].updated_when}</small>
					</div>
					<div class="row overflow-auto px-3">
						{@html $news[activeNews].body}
					</div>
					<div class="row d-flex flex-row justify-content-between">
						<button
							class="btn btn-link col-auto link"
							disabled={activeNews == $news.length - 1}
							onclick={() => {
								activeNews = Math.min($news.length - 1, activeNews + 1);
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
		{#if show == 'About'}
			<div class=" overflow-auto">
				<About />
			</div>
			<hr />
		{/if}
	</div>

	<div
		class="col-lg-6 justify-content-center pt-lg-5 px-lg-2 px-0"
	>
		<div
			id="ExamplesCarousel"
			class="carousel carousel-dark slide px-lg-3 px-0"
		>
			<div class="carousel-inner">
				{#each imgs as img, i}
					<div class="carousel-item {i == 0 ? 'active' : ''} ">
						<img
							src="{base}{img.img}"
							class="mb-3 img-fluid img-thumbnail"
							style="max-height: 100%;"
							alt="..."
						/>

						<div class="carousel-caption d-none d-md-block">
							<p class="bg-light p-0">{img.description}</p>
						</div>
					</div>
				{/each}
			</div>
			<button
				class="carousel-control-prev"
				type="button"
				data-bs-target="#ExamplesCarousel"
				data-bs-slide="prev"
				aria-label="Previous"
			>
				<span class="carousel-control-prev-icon" aria-hidden="false"></span>
			</button>
			<button
				class="carousel-control-next"
				type="button"
				data-bs-target="#ExamplesCarousel"
				data-bs-slide="next"
				aria-label="Next"
			>
				<span class="carousel-control-next-icon" aria-hidden="false"></span>
			</button>
		</div>
	</div>
</div>
