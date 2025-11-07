<script lang="ts">
	import { resolve } from '$app/paths';
	import * as nbc from '$lib/stores/navBarContents';
	import { activeFlight } from '$lib/stores/shared';
	import { user } from '$lib/stores/user';
  import { analyseAll, clearDataLoading } from '$lib/flight/analysis';
  
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
				},
				{
					name: 'Results',
					href: resolve('/flight/results/'),
					icon: 'bi-card-list',
					title: 'View the analysis results',
					disabled: !$activeFlight?.segmentation
				},
        ...($user?.is_superuser ? [{
					name: 'Optimise All',
					onclick: () => {
						analyseAll(true, true);
					},
					icon: 'bi-plus-circle',
					title: 'Load flight data',
					disabled: false
				}] : []),
        {
					name: 'Clear',
					onclick: () => {
						clearDataLoading();
					},
					icon: 'bi-trash',
					title: 'Clear the current flight',
					disabled: false
				}
			]);
		} else {
			nbc.reset();
		}
    nbc.checkUrl();
	});
	
</script>

<slot />
