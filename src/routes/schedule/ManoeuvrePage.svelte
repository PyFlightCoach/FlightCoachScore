<script lang="ts">
	import PlotSec from '$lib/components/plots/PlotSec.svelte';
	import * as mh from '$lib/manoeuvre/manoeuvre_handler.svelte';

	let { man }: { man: mh.ManoeuvreHandler} = $props();
</script>

{#if man.template}
	<PlotSec flst={man.template[0]} expand={50} exclude_controls={['slider', 'showBox']} fixRange hideAxes/>
{/if}
