<script lang='ts'>

  import navBarContents from "$lib/stores/navBarContents";
  import UploadMenu from './UploadMenu.svelte';
  $navBarContents = UploadMenu;

</script>

<slot/>