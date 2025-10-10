<script lang="ts">
	import { breakPoints, breakPoint } from '$lib/stores/shared';
	import { showCollapseToggle } from '$lib/stores/navBarContents';

  
  //A sidebar that becomes an offcanvas at bp.
  //below bp a button to show the offcanvas is added to the bottom navbar


	let {
		side,
		main,
		sideBarWidth = 3,
		bp = 'lg'
	}: {
		side?: any;
		main?: any;
		sideBarWidth?: number;
		bp?: keyof typeof breakPoints;
	} = $props();

	let showSidebar = $derived(breakPoints[bp] < breakPoints[$breakPoint]);

  $effect(() => {
    $showCollapseToggle = !showSidebar;
  });

</script>

{#if side}
	<div
		id="sidebar"
		class="{showSidebar
			? `col-${sideBarWidth}`
			: 'offcanvas offcanvas-start'} bg-light border overflow-scroll"
	>
		{#if !showSidebar}
			<div class="offcanvas-header">
				<button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close">
				</button>
			</div>
		{/if}
		{@render side?.()}
	</div>
{/if}
<div
	class={`${side && showSidebar ? `col-${12 - sideBarWidth}` : 'w-100'} px-0 justify-content-center text-center`}
>
	{@render main?.()}
</div>

