<script lang="ts">
	let {
		name,
		value = $bindable(),
		classappend = '',
		disabled = false,
		title = '',
    required = false,
		validator = (value: number | undefined) => true,
    isValid = $bindable(true)
	}: {
		name: string;
		value: number | undefined;
		classappend?: string;
		disabled?: boolean;
		title?: string;
    required?: boolean;
		validator?: (value: number | undefined) => boolean;
		isValid?: boolean;
	} = $props();

  $effect(() => {
    isValid = validator(value);
  });
</script>

<div class="row mb-2 {classappend} {isValid || !value ? '' : 'bg-warning'}" {title}>
	<label class="col-auto col-form-label" for="numberInput">{name}:</label>
	<input
		class="col col-form-input form-control"
		id="numberInput"
		type="number"
		bind:value
		{required}
		{disabled}
    onchange={() => { isValid = validator(value); }}
	/>
</div>
