<script lang="ts">
	import { resolve } from '$app/paths';
	import * as nbc from '$lib/stores/navBarContents';
	import { activeFlight } from '$lib/stores/shared';

	nbc.reset();

	$effect(() => {
		if ($activeFlight) {
			nbc.reset([
				{
					name: 'Box',
					href: resolve('/flight/create/box/'),
					icon: 'bi-box',
					title: 'Locate the aerobatic box',
					disabled: !$activeFlight
				},
				{
					name: 'Manoeuvres',
					href: resolve('/flight/create/manoeuvres/'),
					icon: 'bi-scissors',
					title: 'Segment the flight into manoeuvres',
					disabled: !$activeFlight?.segmentation
				}
			]);
		} else {
			nbc.reset();
		}
	});
	nbc.checkUrl();
</script>

<slot />
