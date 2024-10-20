<script lang='ts'>
  import BinReader from "$lib/components/BinReader.svelte";
  import BoxReader from './BoxReader.svelte';
	//import FcJsonReader from './FCJsonReader.svelte';
  import {origin} from '$lib/stores/analysis';
  import {base} from "$app/paths";




  
</script>


<BinReader/>
<BoxReader bind:origin={$origin}/>

<li class="nav-item page-item"><a class="nav-link" href={base + "/analysis/upload/"}>Info</a></li>
<li class="nav-item page-item"><a class="nav-link" href={base + "/analysis/upload/box"}>Box</a></li>
<li class="nav-item page-item"><a class="nav-link" href={base + "/analysis/upload/manoeuvres"}>Manoeuvres</a></li>