
<script lang="ts">
  export let data;
</script>

<div>
{#each Object.entries(data.flight) as [key, value]}
    <p>{key}:{value}</p>
{/each}
</div>