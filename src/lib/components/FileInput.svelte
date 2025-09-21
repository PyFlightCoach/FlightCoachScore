<script lang="ts">
	let {
		name,
		file = $bindable(),
    files = $bindable(),
		onchange = (file: File) => {},
		accept = '*'
	}: {
		name: string;
		file: File | undefined;
    files?: FileList | undefined;
		onchange?: (file: File) => void;
		accept: string;
	} = $props();

</script>

<div class="row p-2">
	<label for="{name}fileInputBox" class="col col-form-label">{name}</label>
	<label
		id="{name}fileInputBox"
		for="{name}fileinput"
		class="col btn btn-outline-secondary form-control text-nowrap"
		style:overflow="hidden"
	>
		{file?.name || (files && files[0].name) || 'Select File'}
	</label>
	<input
		id="{name}fileinput"
		class="form-control"
		type="file"
		{accept}
		bind:files
		style="display:none"
		onchange={(e) => {
			const input = e.target as HTMLInputElement;
			if (input && input.files && input.files.length > 0) {
				file = input.files[0];
        onchange(input.files[0]);
			}
		}}
	/>
</div>
