<script lang="ts">

	let {
		isRadio = false,
		options = $bindable<Record<string, boolean>>({})
	}: { isRadio?: boolean; options: Record<string, boolean> } = $props();
</script>

<div class="row p-2">
	<div class="btn-group">
		{#each Object.keys(options) as name}
			<input
				type="checkbox"
				class="btn-check"
				id={name}
				autocomplete="off"
				bind:checked={options[name]}
        onchange = {(e)=>{
          if (isRadio && e.target.checked) {
            Object.keys(options).forEach((n)=>{options[n]=n==name});
          } else {
            options[n] = e.target.checked;
          }
        }}
			/>
			<label class="btn btn-outline-secondary" for={name} title={name}>{name}</label>
		{/each}
	</div>
</div>
