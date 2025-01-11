<script lang="ts">
  import navBarContents from "$lib/stores/navBarContents";

  import Menu from './ScheduleMenu.svelte';

	let { children }: { children?: import('svelte').Snippet } = $props();
  $navBarContents = Menu;
</script>

{@render children?.()}
