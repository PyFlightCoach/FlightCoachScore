<script lang='ts'>
  import {binData, bin, origin} from '$lib/stores/analysis';
  import {base} from "$app/paths";
  import {page} from '$app/stores';
  
  $: datActive = $page.url.pathname.includes('data') ? 'active' : ''
  $: manActive = $page.url.pathname.includes('manoeuvres') ? 'active' : ''
  $: datEnabled = ''
  $: manEnabled = $origin && $binData ? '' : 'disabled'

</script>


<li class="nav-item">
<ul class="pagination">
  <li class="page-item"><a class="nav-link {datActive} {datEnabled}" href={base + "/flight/create/data"}>1 Load Flight Data</a></li>
  <li class="page-item"><a class="nav-link {manActive} {manEnabled}" href={base + "/flight/create/manoeuvres"}>2 Select Manoeuvres</a></li>
</ul>
</li>