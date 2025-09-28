<script lang="ts">
	let { children, show = $bindable(false) }: { children: any; show: boolean } = $props();
</script>

{#if show}
	<div
		class="position-fixed fixed-top container-fluid min-vh-100 d-flex bg-light justify-content-center align-items-center bg-dark vh-100"
		style="z-index: 1; --bs-bg-opacity: .3; "
	>
		<div class="container-auto rounded position-relative p-2 px-5 bg-light text-dark mh-100 overflow-scroll" data-bs-theme="light">
			<button
				type="button"
				class="btn-close position-absolute top-0 end-0 m-2"
				aria-label="Close"
				onclick={() => {
					show = false;
				}}
			></button>
			{@render children?.()}
      </div>
	</div>
{/if}
