<script lang="ts">
	
	import Plot from 'svelte-plotly.js';
  import {states} from '$lib/stores/analysis';

  
  let x = $derived($states?.data.map(st=>st.x) || []);
  let y = $derived($states?.data.map(st=>st.y) || []);


</script>

<Plot
  data={[
    {
      type: 'scatter',
      x,
      y,
    }
  ]}
  layout={{
		yaxis:{scaleanchor:"x", scaleratio:1}
	}}
  fillParent={true}

/>