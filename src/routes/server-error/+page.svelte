<script>
	import { goto } from '$app/navigation';
	import { lastErrorCode, lastErrorText, lastErrorDetail } from '$lib/stores/shared';
  import {base} from '$app/paths';

	if ($lastErrorCode == 401) {
		console.debug('Login session expired');
		goto(base + '/');
	}
</script>

<div class="container">
	<div class="row mt-4">
		<lead>The server responded with error code: {$lastErrorCode}</lead>
		<lead>The error message is: {$lastErrorText}</lead>
		<lead>Further information: {$lastErrorDetail}</lead>
	</div>
</div>
