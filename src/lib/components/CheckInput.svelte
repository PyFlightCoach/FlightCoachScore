<script lang="ts">
	import type { ChangeEventHandler } from "svelte/elements";


	let {
		name = '',
		checked = $bindable(),
    classappend = ""
	}: { name: string; checked: boolean | undefined; classappend?: string } = $props();
</script>

<div class="form-check p-2 px-4">
	<input
		type="checkbox"
		class={"form-check-input " + classappend} 
		{name}
		bind:checked
  />
	<label for="truncate">{name}</label>
</div>
