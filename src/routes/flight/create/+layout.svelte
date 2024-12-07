<script lang='ts'>

  import navBarContents from "$lib/stores/navBarContents";
  import FlightCreateMenu from './FlightCreateMenu.svelte';
  $navBarContents = FlightCreateMenu;

</script>

<slot/>