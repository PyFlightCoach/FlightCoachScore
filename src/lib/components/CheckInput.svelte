<script lang="ts">
	import type { ChangeEventHandler } from 'svelte/elements';

	let {
		name = '',
		checked = $bindable(),
		classappend = '',
		disabled = false,
    title = '',
		onchange = () => {}
	}: {
		name: string;
		checked: boolean | undefined;
		classappend?: string;
		disabled?: boolean;
    title?: string;
		onchange?: ChangeEventHandler<HTMLInputElement>;
	} = $props();
</script>

<div class={'form-check mb-2 ' + classappend} {title}>
	<input type="checkbox" class={'form-check-input'} {name} {disabled} bind:checked {onchange} />
	<label for="truncate">{name}</label>
</div>
