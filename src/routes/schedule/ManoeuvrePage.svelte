<script lang="ts">
	import PlotSec from '$lib/components/plots/PlotSec.svelte';
	import type { ManoeuvreHandler, ManOptionHandler } from '$lib/schedules/schedule_builder';

	let { man }: { man: ManoeuvreHandler | ManOptionHandler } = $props();
</script>

{#if man.template}
	<PlotSec flst={man.template} expand={50} exclude_controls={['slider']} fixRange hideAxes/>
{/if}
