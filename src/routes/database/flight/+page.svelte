<script lang="ts">
  import PlotSec from '$lib/components/plots/PlotSec.svelte';
  export let data;
</script>

<div>
<PlotSec flst={data.mans[0]} />

</div>