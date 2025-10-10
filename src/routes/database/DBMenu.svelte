<script lang='ts'>
  import {resolve} from "$app/paths";
  import {page} from '$app/state';
  
  $: leaActive = page.url.pathname.includes('leaderboards') ? 'active' : ''
  $: mapActive = page.url.pathname.includes('map') ? 'active' : ''
  $: proctive = page.url.pathname.includes('progress') ? 'active' : ''
  
</script>


<a class="col-auto nav-link {leaActive ? 'active' : ''}"  href={resolve("/database/leaderboards")} aria-label="Leaderboards">
  Leaderboards
</a>
<a class="col-auto nav-link {mapActive ? 'active' : ''}" href={resolve("/database/map")} aria-label="Map">
  Map
</a>
