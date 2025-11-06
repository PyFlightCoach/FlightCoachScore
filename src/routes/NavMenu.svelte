<script lang="ts">

	let { tooltip}: { tooltip?: string; } = $props();

  let expanded = $state(false); 

</script>

<div class="nav-item dropdown" >
	<button
		class="nav-link dropdown-toggle ms-2"
		id="navbarDropdown"
		data-bs-toggle="dropdown"
		title={tooltip}
	>
		<slot name="icon"></slot>
	</button>

	<div
		class="dropdown-menu"
		style="position:absolute;"
		aria-labelledby="navbarDropdown"
	>
		<slot />
	</div>
</div>
