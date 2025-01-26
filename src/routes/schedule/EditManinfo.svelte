<script lang="ts">
  import * as mi from '$lib/schedules/maninfo';
  import EnumSelect from '$lib/components/EnumSelect.svelte';

	let {
		newInfo = $bindable(),
		oldInfo,
		canEdit = $bindable(),
		onchange = () => {}
	}: {
		newInfo: mi.ManInfo;
		oldInfo: mi.ManInfo;
		canEdit?: boolean;
		onchange?: (newVal: mi.ManInfo) => void;
	} = $props();



</script>



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
          <EnumSelect
            options={[...mi.Heights]}
            bind:value={newInfo.start.height}
            bind:canEdit
            undefValue="Infer"
            refValue={oldInfo.start.height}
          />
        </td>
        <td class="p-0">
          <EnumSelect
            options={[...mi.Heights]}
            bind:value={newInfo.end.height}
            bind:canEdit
            undefValue="Infer"
            refValue={oldInfo.end.height}
          />
        </td>
      </tr>
      <tr>
        <td>Direction</td>
        <td class="p-0">
          <EnumSelect
            options={[...mi.Directions]}
            bind:value={newInfo.start.direction}
            bind:canEdit
            undefValue="Infer"
            refValue={oldInfo.start.direction}
          />
        </td>
        <td class="p-0">
          <EnumSelect
            options={[...mi.Directions]}
            bind:value={newInfo.end.direction}
            bind:canEdit
            undefValue="Infer"
            refValue={oldInfo.end.direction}
          />
        </td>
      </tr>
      <tr>
        <td>Orientation</td>
        <td class="p-0">
          <EnumSelect
            options={[...mi.Orientations]}
            bind:value={newInfo.start.orientation}
            bind:canEdit
            undefValue="Infer"
            refValue={oldInfo.start.orientation}
          />
        </td>
        <td class="p-0">
          <EnumSelect
            options={[...mi.Orientations]}
            bind:value={newInfo.end.orientation}
            bind:canEdit
            undefValue="Infer"
            refValue={oldInfo.end.orientation}
          />
        </td>
      </tr>
    </tbody>
  </table>
</div>