
<script lang='ts'>
   
  import navBarContents from "$lib/stores/navBarContents";
  
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
  $navBarContents = undefined;

  
</script>

    {@render children?.()}
