<script lang="ts">
	import {binData, bin, bootTime} from '$lib/stores/analysis';
  import { BinData, BinReader, FieldInfo } from '$lib/components/bin';
	import { base } from '$app/paths';

</script>

<div class="col-lg-5 pt-5">
	<div class="row">
		<div class="input-group">
			<BinReader
				onloaded={(...data) => {([$bin, $binData, $bootTime ] = data)}}
			/>
			{#if binData}
				<a
					type="button"
					href={base + '/flight/create/box'}
					class="btn btn-outline-primary form-control">Next</a
				>
			{/if}
		</div>
	</div>
	<div class="row">
		<FieldInfo bind:binData={$binData} />
	</div>
</div>
