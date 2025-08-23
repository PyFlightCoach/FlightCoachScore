<script lang="ts">
	let {
		name,
		value = $bindable(),
		classappend = ''
	}: { name: string; value: string | undefined; classappend?: string } = $props();
</script>

<div class="row p-2 {classappend}">
	<label class="col col-form-label" for="textInput">{name}:</label>
	<input class="col col-form-input form-control" id="textInput" type="text" bind:value required />
</div>
