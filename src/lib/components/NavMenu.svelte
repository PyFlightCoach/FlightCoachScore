<script lang="ts">
  export let tooltip: string=''

</script>



<li class="nav-item dropdown">
	<a
		class="nav-link dropdown-toggle ms-2"
		id="navbarDropdown"
		role="button"
    data-bs-toggle="dropdown"
    aria-expanded="false"	
    title={tooltip}
	>
		<slot name="icon" />
	</a>
  <ul class="dropdown-menu" style="position:absolute;" aria-labelledby="navbarDropdown" >
    <slot />
  </ul>
  
</li>

  


