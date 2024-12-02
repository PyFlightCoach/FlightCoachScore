<script lang="ts">
	export let title: string;
	export let uk: string;
  export let pre: string;
	export let custom: string;
	export let active: string;

	let selected = {uk: 'UK', pre: 'Pre'}[active] || 'Custom';

	$: active = {UK: uk, Pre: pre}[selected] || custom;
</script>

<h6 class="dropdown-header">{title}</h6>
<form>
	<div class="form-check">
		<input
			class="form-check-input"
			type="radio"
			name="server"
			id="uk"
			value="UK"
			bind:group={selected}
		/>
		<label class="form-check-label" for="ukAnalysisServer">UK</label>
	</div>

  <div class="form-check">
		<input
			class="form-check-input"
			type="radio"
			name="server"
			id="pre"
			value="Pre"
			bind:group={selected}
		/>
		<label class="form-check-label" for="ukAnalysisServer">Prerelease</label>
	</div>

	<div class="form-check">
		<input
			class="form-check-input"
			type="radio"
			name="server"
			id="custom"
			value="Custom"
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
