<script lang="ts">
	import type { CompThingSummary, Stage, Round } from './compInterfaces';
	import CompThingManager from './CompThingManager.svelte';
	import { activeComp } from '$lib/stores/contests';

	let {
		parentID = undefined,
		whatAreThey,
		things = $bindable()
	}: {
		parentID?: string;
		whatAreThey: Stage | Round;
		things: CompThingSummary[] | undefined;
	} = $props();

	let showID: number | undefined = $state();
	let createThing: boolean = $state(false);
</script>

<div class="table-responsive">
	<table class="table table-striped text-center">
		<thead class="table-dark" style="z-index:-1">
			<tr>
				<th scope="col" colspan="2">{whatAreThey}s</th>
			</tr>
		</thead>
		<tbody>
			{#each things || [] as thing, i}
				<tr
					role="button"
					onclick={() => {
						if (showID == i) {
							showID = undefined;
						} else {
							showID = i;
						}
					}}
				>
					<td>{thing.name}</td>
					<td>
						{#if showID == i}
							<i class="bi bi-chevron-up"></i>
						{:else}
							<i class="bi bi-chevron-down"></i>
						{/if}
					</td>
				</tr>
				{#if showID == i}
					<tr>
						<td colspan="2">
							<CompThingManager parentID={thing.id} whatAmI={thing.what_am_i} {thing} />
						</td>
					</tr>
				{/if}
			{/each}
			<tr
				role="button"
				onclick={() => {
					showID = undefined;
					createThing = !createThing;
				}}
			>
				<td>Create New {whatAreThey}</td>
				<td>+</td>
			</tr>
			{#if createThing}
				<tr>
					<td colspan="2">
						<CompThingManager parentID={parentID} whatAmI={whatAreThey}  />
					</td>
				</tr>
			{/if}
		</tbody>
	</table>
</div>
