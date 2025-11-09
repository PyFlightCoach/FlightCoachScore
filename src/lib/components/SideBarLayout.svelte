<script lang="ts">
	import { breakPoints, breakPoint } from '$lib/stores/shared';
  import {showCollapseToggle} from '$lib/stores/navBarContents';
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
		sideBarWidth?: number | "auto";
		bp?: keyof typeof breakPoints;
	} = $props();

	let showSidebar = $derived(breakPoints[bp] <= breakPoints[$breakPoint]);

  $effect (() => {
    $showCollapseToggle = !showSidebar;
  });
</script>

{#if side}
	<div
		id="sidebar"
		class="{showSidebar
			? `col-${sideBarWidth}`
			: 'offcanvas offcanvas-start'} bg-light border overflow-auto"
	>
		{#if !showSidebar}
			<div class="offcanvas-header">
				<button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close">
				</button>
			</div>
		{/if}
		<div style="position:relative; height: 100%;">
			<div class="container w-100 overflow-auto" style="position: absolute; top: 0; left: 0; bottom: 0; right: 0;">
				{@render side?.()}
			</div>
		</div>
	</div>
{/if}
<div
	class={`${side && showSidebar ? `col` : 'w-100'} px-0 justify-content-center text-center`}
>
	<div style="position:relative; height: 100%;">
		<div class="container-auto w-100 overflow-auto" style="position: absolute; top: 0; left: 0; bottom: 0; right: 0;">
			{@render main?.()}
		</div>
	</div>
</div>
