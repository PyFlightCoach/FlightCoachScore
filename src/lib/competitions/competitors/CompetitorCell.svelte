<script lang="ts">
	import { activeComp, reloadDropDownComps, setComp } from '$lib/stores/contests';
	import Popup from '$lib/components/Popup.svelte';
	import type { PilotManager } from '$lib/competitions/competitors/PilotManager';
	import DisplayDict from '$lib/components/DisplayDict.svelte';
	import { user } from '$lib/stores/user';

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
	let active = $state(false);
</script>

<td
	class="p-0 px-2 b-0 text-nowrap"
	role={!$activeComp?.isMyComp && !$user?.is_superuser ? '' : 'button'}
	class:active
	onmouseenter={() => {
		active = true;
	}}
	onmouseleave={() => {
		active = false;
	}}
	data-bs-toggle="dropdown"
	aria-haspopup="true"
	aria-expanded="false"
	title="Competitor options"
>
	{competitor.competitor.name}
	<div class="dropdown-menu">
		{#if $activeComp!.isMyComp || $user?.is_superuser}
			<button
				class="dropdown-item"
				onclick={() => {
					showProperties = !showProperties;
				}}
			>
				Competitor Attributes
			</button>
			<button
				class="dropdown-item"
				onclick={() => {
					showUserProperties = !showUserProperties;
				}}
			>
				User Attributes
			</button>

			<button
				class="dropdown-item"
				onclick={() => {
					if (
						confirm(
							`Are you sure you want to remove ${competitor.competitor.name} from this competition?`
						)
					) {
						competitor
							.delete()
							.then(setComp)
							.then(() => {
								if (competitor.competitor.id === $user!.id.replaceAll('-', '')) {
									reloadDropDownComps();
								}
							})
							.catch((err) => {
								alert(
									`Failed to remove ${competitor.competitor.name}: ${err.response?.detail || err.message || err}`
								);
							});
					}
				}}>Remove</button
			>
		{/if}
	</div>
	<Popup bind:show={showProperties}>
		<DisplayDict dict={competitor.competitor} />
	</Popup>
	<Popup bind:show={showUserProperties}>
		<DisplayDict bind:dict={userProperties} />
	</Popup>
</td>

<style>
	.active {
		background: grey;
	}
</style>
