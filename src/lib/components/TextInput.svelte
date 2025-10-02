<script lang="ts">
	let {
		name,
		value = $bindable(),
		classappend = '',
		disabled = false,
		title = '',
    required = false,
		validator = (email: string | undefined) => true,
    isValid = $bindable(true)
	}: {
		name: string;
		value: string | undefined;
		classappend?: string;
		disabled?: boolean;
		title?: string;
    required?: boolean;
		validator?: (email: string | undefined) => boolean;
		isValid?: boolean;
	} = $props();

  $effect(() => {
    isValid = validator(value);
  });
</script>

<div class="row mb-2 {classappend} {isValid || !value ? '' : 'bg-warning'}">
	<label class="col-auto col-form-label" for="textInput">{name}:</label>
	<input
		class="col col-form-input form-control"
		id="textInput"
		type="text"
		bind:value
		{required}
		{disabled}
		{title}
    onchange={() => { isValid = validator(value); }}
	/>
</div>
