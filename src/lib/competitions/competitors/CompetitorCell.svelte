<script lang="ts">
	import { activeComp, setComp } from '$lib/stores/contests';
	import Popup from '$lib/components/Popup.svelte';
	import type { PilotManager } from '$lib/competitions/competitors/PilotManager';
	import DisplayDict from '$lib/components/DisplayDict.svelte';
	let {
		competitor,
		showProperties = $bindable(false),
		showUserProperties = $bindable(false)
	}: {
		competitor: PilotManager;
		showProperties?: boolean;
		showUserProperties?: boolean;
	} = $props();

	let userProperties = $state({});
	competitor.getUser().then((res) => {
		userProperties = res;
	});
</script>

<td class="p-0 h-100">
	<div class="dropdown h-100">
		<button
			type="button"
			class="btn btn-outline-secondary w-100"
			data-bs-toggle="dropdown"
			aria-haspopup="true"
			aria-expanded="false"
			title="Competitor options"
		>
			{competitor.competitor.name}
		</button>
		<div class="dropdown-menu">
			<button
				class="dropdown-item"
				onclick={() => {
					showProperties = !showProperties;
				}}>Competitor Properties</button
			>
			<button
				class="dropdown-item"
				onclick={() => {
					showUserProperties = !showUserProperties;
				}}>User Properties</button
			>
			{#if $activeComp.isMyComp}
				<button
					class="dropdown-item"
					onclick={() => {
						if (confirm(`Are you sure you want to remove ${competitor.competitor.name} from this competition?`)) {
							competitor
								.delete()
								.then(setComp)
								.catch((err) => {
									alert(`Failed to remove ${competitor.competitor.name}: ${err.response?.detail || err.message || err}`);
								});
						}
					}}>Remove</button
				>
			{/if}
		</div>
	</div>
	<Popup bind:show={showProperties}>
		<DisplayDict dict={competitor.competitor} />
	</Popup>
	<Popup bind:show={showUserProperties}>
		<DisplayDict bind:dict={userProperties} />
	</Popup>
</td>
