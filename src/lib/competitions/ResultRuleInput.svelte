<script lang="ts">
  import { type ResultRule } from './compInterfaces';
  let {rule=$bindable<ResultRule>()} : {rule: ResultRule} = $props();
  
  let normaliseOption = $state(rule.raw_score ? "raw" : rule.normalise_average_to_n ? "average" : "best");
  let normTo = $state(1000); 


</script>

<div class="row p-2">
  <label class="col col-form-label" for="normOption">Normalisation:</label>
  <select
    class="col col-form-input form-select"
    id="normOption"
    bind:value={normaliseOption}
    onchange={(e)=>{
      normaliseOption = (e.target as HTMLSelectElement).value;
      rule.raw_score = normaliseOption === "raw";
      
    }}
  >
    <option value="raw">Raw Score</option>
    <option value="best">Best Score</option>
    <option value="average">Average Score</option>
  </select>
</div>
{#if normaliseOption!="raw"}
  <div class="row p-2">
    <label class="col col-form-label" for="normTo">Normalise to:</label>
    <input class="col form-control" type="number" id="normTo" bind:value={normTo} />
  </div>
{/if}
