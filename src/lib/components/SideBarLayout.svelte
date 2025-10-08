<script lang="ts">
	import { windowWidth, breakPoints, breakPoint } from '$lib/stores/shared';

	let {
		side,
		main,
		btmNavs,
		bp = 'lg'
	}: { side: any; main?: any; btmNavs?: any; bp?: keyof typeof breakPoints } = $props();

	let showSidebar = $derived(breakPoints[bp] < breakPoints[$breakPoint]);

	const nextBP = $derived(
		Object.keys(breakPoints)[Math.max(Object.keys(breakPoints).indexOf($breakPoint) - 1, 0)]
	);

	$inspect($breakPoint, nextBP);
</script>

<div
	id="sidebar"
	class="{showSidebar
		? `col-3`
		: 'offcanvas offcanvas-start'} bg-light border overflow-scroll"
>
	{#if !showSidebar}
		<div class="offcanvas-header">
			<button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close">
			</button>
		</div>
  {:else}
    <nav class="nav">
      {@render btmNavs?.()}
    </nav>
	{/if}
	{@render side?.()}
</div>

<div class={`${showSidebar ? "col-9" : "w-100"} px-0 justify-content-center text-center`}>
	{@render main?.()}
</div>

{#if !showSidebar}
	<nav class="navbar fixed-bottom navbar-expand-lg bg-body-secondary">
		<div class="container-fluid justify-content-between">
			<div class="col">
				<a
					class="btn btn-primary"
					data-bs-toggle="offcanvas"
					href="#sidebar"
					role="button"
					aria-label="Toggle sidebar"
				>
					<i class="bi bi-list bi-lg py-2 p-1"></i>
				</a>
			</div>
      {@render btmNavs?.()}
		</div>
	</nav>
{/if}
