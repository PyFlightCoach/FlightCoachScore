<script lang='ts'>
  import {binData, bin, origin} from '$lib/stores/analysis';
  import {base} from "$app/paths";
  import {page} from '$app/stores';
  
  $: datActive = $page.url.pathname.includes('data') ? 'active' : ''
  $: boxActive = $page.url.pathname.includes('box') ? 'active' : ''
  $: manActive = $page.url.pathname.includes('manoeuvres') ? 'active' : ''
  $: datEnabled = ''
  $: boxEnabled = $binData ? '' : 'disabled'
  $: manEnabled = $origin && $binData ? '' : 'disabled'

</script>


<li class="nav-item">
<ul class="pagination">
  <li class="page-item"><a class="nav-link {datActive} {datEnabled}" href={base + "/analysis/create/data"}>1 Load Flight Data</a></li>
  <li class="page-item"><a class="nav-link {boxActive} {boxEnabled}" href={base + "/analysis/create/box"}>2 Define the Box</a></li>
  <li class="page-item"><a class="nav-link {manActive} {manEnabled}" href={base + "/analysis/create/manoeuvres"}>3 Select Manoeuvres</a></li>
</ul>
</li>