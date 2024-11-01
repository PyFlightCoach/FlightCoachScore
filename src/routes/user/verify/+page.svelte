<script lang="ts">
	import { base } from '$app/paths';
  export let data;

</script>

<div class="col-md-6 pt-5">
<p class="lead">
	Thank you for completing verification. ({data.first_name} {data.last_name}, {data.email})
</p>
<p class="lead">
	You can now <a href="{base}/user/login">login</a> in to the FC Score Database and start uploading your flights!
</p>
</div>