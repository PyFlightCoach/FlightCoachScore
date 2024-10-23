<script lang="ts">
  import navBarContents from "$lib/stores/navBarContents";
  import AnalysisMenu from './ResultsMenu.svelte';
  $navBarContents = AnalysisMenu;

</script>

<slot/>