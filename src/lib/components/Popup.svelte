<script lang="ts">
	let {
		children,
		show = $bindable(),
		title = $bindable()
	}: { children: any; show: any | undefined; title: string } = $props();
</script>

{#if show}
	<dialog
		class="position-fixed fixed-top container-fluid min-vh-100 d-flex bg-light justify-content-center align-items-center bg-dark vh-100 "
		style="--bs-bg-opacity: .3; min-height: 100svh; "
	>
		<div
			class="container-auto rounded position-relative bg-light text-dark mh-100 mw-100 d-flex flex-column"
			data-bs-theme="light"
		>
			<div class="col-auto d-flex flex-row">
				<div class="col"><h5>{title}</h5></div>
				<button
					type="button"
					class="col-auto btn-close px-3"
					aria-label="Close"
					onclick={() => {
						show = false;
					}}
				></button>
			</div>
			<div class="col d-flex flex-row ps-3 pb-1">
        <div class="row overflow-auto " style="max-height: 80vh; max-width: 100%;">
				{@render children?.()}
        </div>
			</div>
		</div>
	</dialog>
{/if}
