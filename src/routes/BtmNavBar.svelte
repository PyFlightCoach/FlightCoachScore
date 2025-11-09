<script lang="ts">
	import * as nbc from '$lib/stores/navBarContents';
	import { navBarContents, showCollapseToggle } from '$lib/stores/navBarContents';
</script>

{#if $navBarContents.items.length || $showCollapseToggle}
	<nav class="navbar fixed-bottom navbar-expand-lg bg-body-secondary d-lg-none p-0">
		<div class="container-fluid justify-content-between ">
			<div class="col-auto"></div>
			<div class="col row">
				{#each $navBarContents.items as pageLink, i}
					<button
						class="col px-4 nav-link {pageLink.active ? 'bg-secondary' : ''}"
						role="link"
						onclick={() => {
							nbc.click(i);
						}}
						title={pageLink.title}
						data-sveltekit-preload-data="tap"
						disabled={pageLink.disabled}
					>
						{#if pageLink.icon}
							<i class={'bi ' + pageLink.icon}></i>
						{:else}
							{pageLink.name}
						{/if}
					</button>
				{/each}
			</div>
			<div class="col-auto">
				{#if $showCollapseToggle}
					<a
						class="btn btn-primary"
						data-bs-toggle="offcanvas"
						href="#sidebar"
						role="button"
						aria-label="Toggle sidebar"
						title="Show sidebar"
					>
						<i class="bi bi-list bi-lg py-2 p-1"></i>
					</a>
				{/if}
			</div>
		</div>
	</nav>
{/if}
