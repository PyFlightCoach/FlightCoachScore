<script lang="ts">
	import PlotSec from '$lib/components/plots/PlotSec.svelte';
	import type { ManoeuvreHandler, ManOptionHandler } from '$lib/schedules/manoeuvre_handler';

	let { man }: { man: ManoeuvreHandler | ManOptionHandler } = $props();
</script>

{#if man.template}
	<PlotSec flst={man.template} expand={50} exclude_controls={['slider', 'showBox']} fixRange hideAxes/>
{/if}
