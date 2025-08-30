<script lang="ts">
	import type { ChangeEventHandler } from "svelte/elements";


	let {
		name = '',
		checked = $bindable(),
    classappend = "",
    disabled=false,
	}: { name: string; checked: boolean | undefined; classappend?: string; disabled?: boolean } = $props();
</script>

<div class={"form-check p-2 px-4 " + classappend}>
	<input
		type="checkbox"
		class={"form-check-input"} 
		{name}
    {disabled}
		bind:checked
  />
	<label for="truncate">{name}</label>
</div>
