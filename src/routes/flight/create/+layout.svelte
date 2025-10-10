<script lang="ts">
	import { resolve } from '$app/paths';
  import { binData, bin, origin } from '$lib/stores/analysis';
  import * as nbc from '$lib/stores/navBarContents';

	nbc.reset();

	$effect(() => {
		nbc.reset([
			{
				name: '1. Data',
				href: resolve('/flight/create/data/'),
				icon: 'bi-plus-circle',
				title: 'Load flight data',
				disabled: false
			},
			{
				name: '2. Manoeuvres',
				href: resolve('/flight/create/manoeuvres/'),
				icon: 'bi-plus-circle',
				title: 'Load flight data',
				disabled: !$origin || !$binData
			}
		]);
    nbc.checkUrl();
	});

</script>

<slot />
