<script lang="ts">
	export let title: string;
  export let options: string[];
	export let custom: string;
	export let selected: string;

</script>

<h6 class="dropdown-header">{title}</h6>
<form>
	{#each options as option}
    <div class="form-check">
      <input
        class="form-check-input"
        type="radio"
        name="server"
        id={option}
        value={option}
        bind:group={selected}
      />
      <label class="form-check-label" for="ukAnalysisServer">{option}</label>
    </div>
  {/each}
	<div class="form-check">
		<input
			class="form-check-input"
			type="radio"
			name="server"
			id="custom"
			value="custom"
			bind:group={selected}
		/>
		<input type="text" class="form-control small-text text-nowrap" bind:value={custom} />
	</div>
</form>

<style>
	.small-text {
		font-size: 0.7rem;
	}
</style>
