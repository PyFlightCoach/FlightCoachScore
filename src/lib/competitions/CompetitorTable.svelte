<script lang="ts">
  import { type Competitor } from "$lib/competitions/compInterfaces";

let {competitors} : {competitors: Competitor[]} = $props();

</script>

<span>Competitors:</span>
{#each competitors as competitor}
  <p>{competitor.name}</p>
{/each}