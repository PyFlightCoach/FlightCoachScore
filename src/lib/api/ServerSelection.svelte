<script lang="ts">

	interface Props {
		title: string;
		options: string[];
		custom: string;
		selected: string;
    onselected?: (value: string) => void;
	}

	let {
		title,
		options,
		custom = $bindable(),
		selected = $bindable(),
    onselected = () => {},
	}: Props = $props();

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
        onchange={() => onselected(selected)}
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
      onchange={() => onselected(selected)}
		/>
		<input type="text" class="form-control small-text text-nowrap" bind:value={custom} />
	</div>
</form>

<style>
	.small-text {
		font-size: 0.7rem;
	}
</style>
