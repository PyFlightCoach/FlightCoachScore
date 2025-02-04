<script lang="ts">
	import { ManInfo } from '$lib/manoeuvre/info.svelte';
	import * as pos from '$lib/manoeuvre/positioning.svelte';
	import EnumSelect from '$lib/components/EnumSelect.svelte';

	let {
		newInfo = $bindable(),
		oldInfo,
		canEdit,
		onchange = () => {}
	}: {
		newInfo: ManInfo;
		oldInfo: ManInfo;
		canEdit?: boolean;
		onchange?: (newVal: ManInfo) => void;
	} = $props();

</script>

<div class="row">
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
				<td class="text-start">Height</td>
				<td class="p-0">
					<EnumSelect
						options={[...pos.heights]}
						bind:value={newInfo.start.height}
						bind:canEdit
						undefValue="Infer"
						refValue={oldInfo.start.height}
					/>
				</td>
				<td class="p-0">
					<EnumSelect
						options={[...pos.heights]}
						bind:value={newInfo.end.height}
						bind:canEdit
						undefValue="Infer"
						refValue={oldInfo.end.height}
					/>
				</td>
			</tr>
			<tr>
				<td class="text-start">Direction</td>
				<td class="p-0">
					<EnumSelect
						options={[...pos.directions]}
						bind:value={newInfo.start.direction}
						bind:canEdit
						undefValue="Infer"
						refValue={oldInfo.start.direction}
					/>
				</td>
				<td class="p-0">
					<EnumSelect
						options={[...pos.directions]}
						bind:value={newInfo.end.direction}
						bind:canEdit
						undefValue="Infer"
						refValue={oldInfo.end.direction}
					/>
				</td>
			</tr>
			<tr>
				<td class="text-start">Orientation</td>
				<td class="p-0">
					<EnumSelect
						options={[...pos.orientations]}
						bind:value={newInfo.start.orientation}
						bind:canEdit
						undefValue="Infer"
						refValue={oldInfo.start.orientation}
					/>
				</td>
				<td class="p-0">
					<EnumSelect
						options={[...pos.orientations]}
						bind:value={newInfo.end.orientation}
						bind:canEdit
						undefValue="Infer"
						refValue={oldInfo.end.orientation}
					/>
				</td>
			</tr>
			<tr>
				<td class="text-start">Position</td>
				<td class="p-0" colspan="2">
					<EnumSelect
						options={[...pos.positions]}
						bind:value={newInfo.position}
						bind:canEdit
						undefValue={undefined}
						refValue={oldInfo.position}
					/>
				</td></tr
			>
		</tbody>
	</table>
</div>

