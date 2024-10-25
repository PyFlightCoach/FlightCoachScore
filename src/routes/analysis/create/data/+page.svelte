<script lang="ts">
	import { BinData, BinField, BinReader, FieldInfo } from '$lib/components/bin';
	import { binData, bin, bootTime } from '$lib/stores/analysis';
	import { base } from '$app/paths';

	let busy: boolean = false;
</script>

<div class="col-md-5 pt-5">
	<div class="row">
		<div class="input-group">
			<BinReader bind:binData={$binData} bind:bin={$bin} bind:bootTime={$bootTime} bind:busy />
			{#if $binData}
				<a
					type="button"
					href={base + '/analysis/create/box'}
					class="btn btn-outline-primary form-control">Next</a
				>
			{/if}
		</div>
	</div>
	<div class="row">
		<FieldInfo bind:binData={$binData} />
	</div>
</div>
