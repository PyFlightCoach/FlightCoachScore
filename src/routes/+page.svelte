<script lang="ts">
	import { news } from '$lib/stores/shared';
	import { user } from '$lib/stores/user';
	import About from './About.svelte';
  import UserActivity from './UserActivity.svelte';
  import * as nbc from '$lib/stores/navBarContents';

  nbc.reset();
	let activeNews = $state(0);
	let show = $state('About');

	$effect(() => {
		show = $user && $news.length ? 'News' : 'About';
	});


</script>

<div class="row justify-content-around">
	<div class="col-lg-{$user ? '6' : '10'} col-auto px-lg-2 px-0">
		<div class="row mb-3">
			<h1 class="text-center pt-3 h-1">Flight Coach Score</h1>
			<lead class="lead text-center text-muted"
				>Automatic judging and score sharing for precision aerobatics</lead
			>
		</div>
		<hr />

		{#if $user && $news.length}
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
  {#if $user}
    <div class="col-lg-6 justify-content-center px-lg-2 px-0">
        <UserActivity />
    </div>
  {/if}
</div>
