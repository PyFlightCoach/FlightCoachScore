<script lang="ts">
	import { loading, blockingProgress, blockingProgressTitle } from '$lib/stores/shared';
</script>

{#if $loading || $blockingProgress}
	<div
		class="position-fixed container-fluid min-vh-100 d-flex bg-light justify-content-center align-items-center"
		style="z-index: 1; --bs-bg-opacity: .5;"
	>
		<div>
			{#if $blockingProgress}
				<span>{$blockingProgressTitle}</span>
				<div class="progress" style="width:300px;">
					<div
						class="progress-bar"
						role="progressbar"
						aria-label="Example with label"
						aria-valuenow={$blockingProgress * 100}
						style="width: {($blockingProgress * 100).toFixed(0)}%"
						aria-valuemin="0"
						aria-valuemax="100"
					>
						{($blockingProgress * 100).toFixed(0)}%
					</div>
				</div>
			{:else}
				<div class="col-auto spinner-border" role="status"></div>
			{/if}
		</div>
	</div>
{/if}
