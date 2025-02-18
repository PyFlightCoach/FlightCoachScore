<script lang="ts">
	import { Origin } from '$lib/flight/fcjson';
	import { GPS } from '$lib/utils/geometry';
	import { getShortlist, FCSite } from '$lib/flight/box/fcsites';

	let {
		target,
		onchange = () => {}
	}: {
		target: GPS;
		onchange: (origin: Origin) => void;
	} = $props();

	let selectedSiteId: number | undefined = $state();
	let shortlist: FCSite[] = $derived(getShortlist(target));

	const selectSite = () => {
		if (shortlist && typeof selectedSiteId != 'undefined' && selectedSiteId < shortlist.length) {
			onchange(
				Origin.from_centre(
					new GPS(
						shortlist[selectedSiteId].pilot.lat,
						shortlist[selectedSiteId].pilot.lon,
						target?.alt || shortlist[selectedSiteId].pilot.alt
					),
					new GPS(
						shortlist[selectedSiteId].center.lat,
						shortlist[selectedSiteId].center.lon,
						target?.alt || shortlist[selectedSiteId].center.alt
					)
				)
			);
		}
	};



</script>

<select class="form-select" size="3" bind:value={selectedSiteId} onchange={selectSite}>
	{#if shortlist}
		{#each shortlist as site, i}
			<option value={i}>{site.description}</option>
		{/each}
	{/if}
</select>
