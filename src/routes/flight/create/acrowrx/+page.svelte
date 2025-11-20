<script lang="ts">
	import { resolve } from '$app/paths';
  import { loading } from '$lib/stores/shared';
	import { goto } from '$app/navigation';

	import { loadAcrowrx } from '$lib/flight/analysis';

  let file: File | undefined = $state()
</script>

<div class="container-auto py-4" style="max-width: 800px;">
	<div class="row">
		<label for="bin-file-input" class="col col-form-label">Select Acrowrx File:</label>
		<input
			id="binfile"
			class="col form-control"
			type="file"
			accept=""
			onchange={(e: Event) => {
				file = (e.target as HTMLInputElement).files?.item(0) || undefined;
			}}
		/>  
	</div>
	{#if file}
		<div class="row py-4">
			<div class="col"></div>

			<button
				class="col btn btn-outline-primary"
				onclick={() => {
          loadAcrowrx(file!).then(() => {
            goto(resolve('/flight/create/box'));
          });
					
				}}>Next</button
			>
		</div>
	{/if}
</div>
