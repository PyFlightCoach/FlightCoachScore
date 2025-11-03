<script lang="ts">
	import { resolve } from '$app/paths';
	import { binData, bin, origin } from '$lib/stores/analysis';
	import * as nbc from '$lib/stores/navBarContents';
		import { flight } from '$lib/stores/shared';

	nbc.reset();

	$effect(() =>
		nbc.reset([
			{
				name: 'Box',
				href: resolve('/flight/create/box/'),
				icon: 'bi-box',
				title: 'Locate the aerobatic box',
				disabled: !$flight
			},
			{
				name: 'Manoeuvres',
				href: resolve('/flight/create/manoeuvres/'),
				icon: 'bi-scissors',
				title: 'Segment the flight into manoeuvres',
				disabled: !$flight?.states
			}
		])
	);
	nbc.checkUrl();
</script>

<slot />
