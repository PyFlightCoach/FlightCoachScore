<script lang="ts">
	import { type ManoeuvreHandler } from '$lib/schedules/schedule_builder';
	import * as mi from '$lib/schedules/maninfo';
	import { PE, formatArg } from '$lib/schedules/aresti';
	import EnumSelect from '$lib/components/EnumSelect.svelte';
	import { dbServer } from '$lib/api';
	import { loadSchedulesforUser } from '$lib/schedules/library';
	import { user } from '$lib/stores/user';

	let {
		manoeuvre,
		entry = undefined,
		canEdit = false,
		ondelete = () => {}
	}: {
		manoeuvre: ManoeuvreHandler;
		entry?: mi.BoxLocation | undefined;
		canEdit?: boolean;
		ondelete?: () => void;
	} = $props();

	let entryHeight = $state(manoeuvre.info.start?.height || 'Infer');
	let entryDirection = $state(manoeuvre.info.start?.direction || 'Infer');
	let entryOrientation = $state(manoeuvre.info.start?.orientation || 'Infer');
	let exitHeight = $state(manoeuvre.info.end?.height || 'Infer');
	let exitDirection = $state(manoeuvre.info.end?.direction || 'Infer');
	let exitOrientation = $state(manoeuvre.info.end?.orientation || 'Infer');
</script>

<div class="container-fluid">
	{#if canEdit}
		<div class="row">
			<button class="col btn btn-outline-secondary" disabled>Patch</button>
			<button class="col btn btn-outline-secondary" disabled>Reload</button>
			<button
				class="col btn btn-outline-secondary"
				onclick={() => {
					if (
						confirm(
							'Are you sure you want to delete this manoeuvre? Please check the next manoeuvre will link to the previous one first.'
						)
					) {
						if (manoeuvre.dbManoeuvre) {
							dbServer.delete(`schedule/manoeuvre/${manoeuvre.dbManoeuvre.id}`).then(() => {
								loadSchedulesforUser('admin@fcscore.org');
								if ($user) loadSchedulesforUser($user.email);
							});
						}
						ondelete();
					}
				}}>Delete</button
			>
		</div>
	{/if}

	<div class="row pt-2">
		<table class="table table-sm table-borderless">
			<thead>
				<tr>
					<th></th>
					<th>Entry</th>
					<th>Exit</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>Height</td>
					<td class="p-0">
						<EnumSelect options={[...mi.Heights, 'Infer']} bind:value={entryHeight} bind:canEdit />
					</td>
					<td class="p-0">
						<EnumSelect options={[...mi.Heights, 'Infer']} bind:value={exitHeight} bind:canEdit />
					</td>
				</tr>
				<tr>
					<td>Direction</td>
					<td class="p-0">
						<EnumSelect
							options={[...mi.Directions, 'Infer']}
							bind:value={entryDirection}
							bind:canEdit
						/>
					</td>
					<td class="p-0">
						<EnumSelect
							options={[...mi.Directions, 'Infer']}
							bind:value={exitDirection}
							bind:canEdit
						/>
					</td>
				</tr>
				<tr>
					<td>Orientation</td>
					<td class="p-0">
						<EnumSelect
							options={[...mi.Orientations, 'Infer']}
							bind:value={entryOrientation}
							bind:canEdit
						/>
					</td>
					<td class="p-0">
						<EnumSelect
							options={[...mi.Orientations, 'Infer']}
							bind:value={exitOrientation}
							bind:canEdit
						/>
					</td>
				</tr>
			</tbody>
		</table>
	</div>

	{#if manoeuvre.aresti}
		<div class="row pt-2">
			<table class="table table-sm table-borderless">
				<thead>
					<tr>
						<th>element</th>
						<th>props</th>
					</tr>
				</thead>
				<tbody>
					{#each manoeuvre.aresti.elements as pe, i}
						<tr>
							{#if pe instanceof PE}
								<td>{pe.kind}</td>
								<td>{pe.args.map((a) => formatArg(a)).join(', ')}</td>
							{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
