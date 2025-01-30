<script lang="ts">
	import { Origin } from '$lib/flight/fcjson';
	import { GPS } from '$lib/utils/geometry';
	import { FCSite, getSites } from '$lib/flight/box/box';

	export let origin: Origin | undefined = undefined;
	export let target: GPS | undefined = undefined;
	let selectedSiteId: number | undefined;
	let sites: FCSite[] | undefined;

	$: if (target) {
		selectedSiteId = undefined;
		getSites().then((res) => {
			sites = res
				.sort((a, b) => {
					if (GPS.sub(a.pilot, target).length() > GPS.sub(b.pilot, target).length()) {
						return 1;
					} else {
						return -1;
					}
				})
				.slice(undefined, 4);
		});
	}

	$: if (selectedSiteId && sites) {
    origin = Origin.from_centre(
			sites[selectedSiteId - 1].pilot,
			sites[selectedSiteId - 1].center
		);
	}
</script>

<select class="form-select" size="3" bind:value={selectedSiteId}>
  {#if sites}
  {#each sites as site, i}
    <option value={i + 1}>{site.description()}</option>
  {/each}
  {/if}
</select>

