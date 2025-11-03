<script lang="ts">
	import { resolve } from '$app/paths';
	import { analysisServer } from '$lib/api';
	import { loading } from '$lib/stores/shared';
	import { States } from '$lib/utils/state';
	import { Origin } from '$lib/flight/fcjson';
		import { flight } from '$lib/stores/shared';
	import { Flight, FlightDataSource, GlobalState } from '$lib/flight/flight';
	import { goto } from '$app/navigation';
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
				console.log(e);
				const file = (e.target as HTMLInputElement).files?.item(0) || undefined;
				if (file) {
					$loading = true;
					const fd = new FormData();
					fd.append('acrowrx_file', file);
					analysisServer
						.post('/read_acrowrx', fd, {
							headers: {
								'Content-Type': 'multipart/form-data'
							}
						})
						.then((response) => {
              const origin = Object.setPrototypeOf(response.data.origin, Origin.prototype)
              const bootTime = new Date(Date.parse(response.data.boot_time));
							$flight = new Flight(
								new FlightDataSource(
									file,
									'acrowrx',
									undefined,
									bootTime,
									new GlobalState(origin, response.data.boot_time, States.parse(response.data.data))
								),
							);
						})
						.finally(() => {
							$loading = false;
						});
				}
			}}
		/>
	</div>
  {#if $flight}
	<div class="row py-4">
		<div class="col"></div>
		
			<button
				class="col btn btn-outline-primary"
				onclick={() => {
					goto(resolve('/flight/create/box'));
				}}>Next</button
			>
		
	</div>
  {/if}
</div>
