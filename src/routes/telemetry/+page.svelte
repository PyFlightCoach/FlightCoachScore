<script lang="ts">
	import Plot from 'svelte-plotly.js';
	import { analysisServer } from '$lib/api';
	import { user } from '$lib/stores/user';

	let telemetry: Record<string, string[]> | undefined = $state();
	if ($user?.is_superuser) {
		analysisServer.get('telemetry').then((res) => {
			telemetry = res.data;
		});
	}
</script>

<div class="col">
	<Plot
		data={[{ x: telemetry?.date?.map((d) => new Date(Date.parse(d))) || [], type: 'histogram' }]}
		fillParent={true}
    layout={{ title: 'Analysis Server Telemetry', xaxis: { title: 'Date' }, yaxis: { title: 'Analysed Manoeuvres' } }}
	/>
</div>
