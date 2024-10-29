<script lang="ts">
	import { binData, origin, fcj } from '$lib/stores/analysis';
	import { FCJson } from '$lib/analysis/fcjson';
	import { BoxReader } from '$lib/components/box';
	import { MapPlot } from '$lib/components/plots/map';
	import { base } from '$app/paths';

	let fcjson: FCJson | undefined = undefined;
	let getmans: boolean = true;
</script>

<div class="col-6 pt-5">
	<BoxReader bind:origin={$origin} bind:fcjson>
		{#if fcjson}
			<div class="input-group-text">
				<input
					id="getmans"
					class="form-check-input mt-0"
					type="checkbox"
					bind:checked={getmans}
					aria-label="Parse manoeuvre split locations from FC json"
				/>
				<label for="getmans" class="form-check-label">Include Manoeuvres</label>
			</div>
		{/if}
		{#if $origin}
			<a
				class="btn btn-outline-secondary form-control-sm"
				on:click={() => {
					$fcj = fcjson;
				}}
				href={base + '/flight/create/manoeuvres'}
			>
				Next
			</a>
		{/if}
	</BoxReader>
</div>
<div class="col-6">
	<MapPlot bind:origin={$origin} bind:binData={$binData} />
</div>
