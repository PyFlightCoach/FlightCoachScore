<script lang="ts">
	import * as nbc from '$lib/stores/navBarContents';
	import { navBarContents, showCollapseToggle } from '$lib/stores/navBarContents';
</script>

{#if $showCollapseToggle}
	
		<div class="container-fluid d-flex flex-row justify-content-between p-0 bg-light border-top">
			<div class="col-auto"></div>
      <div class="col-auto p-0 justify-content-center">
        <div class="btn-group">
				{#each $navBarContents.items as pageLink, i}
					<button
						class="px-3 btn btn-outline-secondary {pageLink.active ? 'bg-secondary' : ''}"
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

{/if}
