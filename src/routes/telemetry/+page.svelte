<script lang="ts">
	import Plot from '$lib/plots/Plotly.svelte';
	import { analysisServer } from '$lib/api/api';
	import { user } from '$lib/stores/user';
	import { saveAs } from 'file-saver';
  import * as nbc from '$lib/stores/navBarContents';

  nbc.reset();
	let telemetry: Record<string, string[]> | undefined = $state();

	const loadTelemetry = () => {
		if ($user?.is_superuser) {
			analysisServer.get('telemetry').then((res) => {
				telemetry = res.data;
			});
		}
	};
  const saveTelemetry = () => {
    if ($user?.is_superuser && telemetry) {
      saveAs(new Blob([JSON.stringify(telemetry)], { type: 'application/json' }), 'telemetry.json');
    }
  };
</script>

<div class="row">
	<div class="col">
		<Plot
			data={[{ x: telemetry?.date?.map((d) => new Date(Date.parse(d))) || [], type: 'histogram' }]}
			fillParent={true}
			layout={{
				yaxis: { title: 'Analysed Manoeuvres' }
			}}
		/>
	</div>
</div>

<nav class="navbar navbar-expand-lg fixed-bottom">
	<div class="container-fluid justify-content-center">
		<button class="nav-item btn btn-outline-primary px-2" onclick={saveTelemetry} disabled={!telemetry}>Save</button>
		<button class="nav-item btn btn-outline-primary px-2" onclick={loadTelemetry}>Refresh</button>
	</div>
</nav>
