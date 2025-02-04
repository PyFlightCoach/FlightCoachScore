<script lang="ts">
	import { PE } from '$lib/manoeuvre/aresti.svelte';
	import type { ManBuilder } from '$lib/manoeuvre/builder.svelte';
	import EditElement from './EditElement.svelte';
	import type { MPValue } from '$lib/manoeuvre/definition.svelte';

	let {
		pes = $bindable(),
		canEdit,
		onchange = () => {},
		refpes = $bindable(),
		activeElID = $bindable(undefined),
		isCentreManoeuvre = false,
		builder,
		mpValues
	}: {
		pes: (PE | number)[];
		canEdit?: boolean;
		onchange?: (new_pes: (PE | number)[]) => void;
		refpes: (PE | number)[];
		activeElID?: number | undefined;
		isCentreManoeuvre?: boolean;
		builder: ManBuilder;
		mpValues: Record<string, MPValue>;
	} = $props();

	let isPeUpdated = $derived(
		pes.map((pe, i) => (typeof pe == 'number' ? false : !PE.compare(refpes[i] as PE, pe as PE)))
	);
	$inspect(pes);
</script>

{#each pes as pe, i}
	<div class="container-fluid">
		<div class="row">
			{#if typeof pe == 'number'}
				{#if isCentreManoeuvre}
					<button class="col btn btn-outline-secondary" disabled> Centre </button>
				{/if}
			{:else}
				<button
					class="col btn btn-outline-secondary"
					onclick={() => {
						if (activeElID == i) {
							activeElID = undefined;
						} else {
							activeElID = i;
						}
					}}
				>
					{pe.centred ? 'Centred' : ''}
					{pe.summary(builder.element_builders[pe.kind])}
					{#if activeElID == i}
						<i class="bi bi-chevron-up"></i>
					{:else}
						<i class="bi bi-chevron-down"></i>
					{/if}
					{#if isPeUpdated[i]}
						<span class="badge bg-warning">Updated</span>
					{/if}
				</button>
			{/if}
			{#if canEdit}
				<div class="col-auto dropdown px-0">
					<button
						class="col-auto btn btn-outline-secondary dropdown-toggle"
						disabled={!canEdit}
						data-bs-toggle="dropdown"
						aria-expanded="false"
						aria-label="Toggle Dropdown"
						title="Insert Element Above"
					>
						<i class="bi bi-plus-lg"></i>
					</button>
					<ul class="dropdown-menu">
						{#each Object.keys(builder.element_builders) as elkind}
							<li>
								<button
									class="dropdown-item"
									onclick={() => {
										pes.splice(
											i,
											0,
											new PE(
												elkind,
												Array.from({ length: builder.element_builders[elkind].args.length }).map(
													() => 0
												),
												{}
											)
										);
									}}
								>
									{elkind}
								</button>
							</li>
						{/each}
					</ul>
				</div>
				<button
					class=" col-auto btn btn-outline-secondary"
					disabled={!canEdit}
					onclick={() => {
						activeElID = undefined;
						pes.splice(i, 1);
					}}
					aria-label="Delete"
					title="Delete this Element"
				>
					<i class="bi bi-trash"></i>
				</button>
			{/if}
		</div>
	</div>

	{#if activeElID == i && typeof pe != 'number'}
		<EditElement
			bind:pe={pes[i] as PE}
			refpe={refpes[i] as PE}
			{builder}
			{canEdit}
			{mpValues}
			{isCentreManoeuvre}
		/>
	{/if}
{/each}

<div class="input-group pt-2">
	<span class="input-group-text" title="Add an Element"><i class="bi bi-plus-lg"></i></span>
	<div class="btn-group" id="add_element">
		{#each Object.keys(builder.element_builders) as elkind}
			<button
				class="btn btn-outline-secondary btn-sm"
				disabled={!canEdit}
				data-sveltekit-preload-data="tap"
				title="Append {elkind}"
				onclick={() => {
					pes.push(
						new PE(
							elkind,
							Array.from({ length: builder.element_builders[elkind].args.length }).map(() => 0),
							{}
						)
					);
				}}
			>
				{elkind}
			</button>
		{/each}
		<button
			class="btn btn-outline-secondary"
			disabled={!canEdit}
			title="Append Centre Point"
			onclick={() => {
				pes.push(0);
			}}
		>
			Centre
		</button>
	</div>
</div>
