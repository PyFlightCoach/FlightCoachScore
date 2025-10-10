
<script lang='ts'>
  import * as nbc from '$lib/stores/navBarContents';

  
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  nbc.reset();
  
</script>

    {@render children?.()}
