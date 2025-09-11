<script lang="ts">
  import DDR from '$lib/components/DisplayDictRows.svelte';
	let {
		dict = $bindable({} as Record<string, any>)
	}: { dict: Record<string, any>; title?: string } = $props();

</script>


{#if Object.keys(dict).length == 0}
	<em>No data</em>
{:else}
	<div class="table-responsive">
		<table class="table table-sm">
			<tbody>
        <DDR bind:dict={dict} />
			</tbody>
		</table>
	</div>
{/if}
