<script lang='ts'>
  import {base} from "$app/paths";
  import {page} from '$app/stores';
  
  $: leaActive = $page.url.pathname.includes('leaderboards') ? 'active' : ''
  $: mapActive = $page.url.pathname.includes('map') ? 'active' : ''
  $: proctive = $page.url.pathname.includes('progress') ? 'active' : ''
  
//  <li class="page-item"><a class="nav-link {leaActive} " href={base + "/database/query/leaderboards"}>Leaderboards</a></li>
//  <li class="page-item"><a class="nav-link {mapActive} " href={base + "/database/map"}>Map</a></li>
//  <li class="page-item"><a class="nav-link {proctive} " href={base +  "/database/progress"}>Progress</a></li>
</script>


<li class="nav-item">
  <ul class="pagination" >
    
  </ul>
</li>