<script lang='ts'>
  import {base} from "$app/paths";
</script>

<nav class="navbar navbar-expand-sm bg-body-tertiary" data-bs-theme="dark">
	<div class="container-fluid">
		<a class="navbar-brand" href={base + '/'}>FCScore</a>

		<button
			class="navbar-toggler"
			type="button"
			data-bs-toggle="collapse"
			data-bs-target="#navbarSupportedContent"
			aria-controls="navbarSupportedContent"
			aria-expanded="false"
			aria-label="Toggle navigation"
		>
			<span class="navbar-toggler-icon"></span>
		</button>

		<div class="collapse navbar-collapse" id="navbarSupportedContent">
			<ul class="navbar-nav mr-auto mb-2 mb-lg-0">				
      
        <slot  />
      </ul>
    </div>


	</div>
</nav>


