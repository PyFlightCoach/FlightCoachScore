<script lang="ts">
	import type { CompThingMeta } from '$lib/api/DBInterfaces/competition';

	let {
		oldMeta,
		newMeta = $bindable(),
		showChanges = true,
    whatAmI
	}: {
		oldMeta: CompThingMeta;
		newMeta: CompThingMeta;
		showChanges?: boolean;
    whatAmI: string;
	} = $props();

	function hasChanged(val1: any, val2: any) {
		return val1 != val2 && showChanges ? 'bg-warning' : '';
	}

  let description=$state(oldMeta.description || undefined);
  let start_date=$state(oldMeta.start_date || undefined);
  let end_date= $state(oldMeta.end_date || undefined);
  
  $effect(()=>{
    newMeta = {
      description: description === "" ? undefined : description ,
      start_date: start_date==="" ? undefined : start_date,
      end_date: end_date==="" ? undefined : end_date
    } as CompThingMeta
  });

</script>

<label class="row form-label" for="description">Description:</label>
<textarea class="form-control mb-2 {hasChanged(newMeta?.description, oldMeta.description)}" id="description" rows="3" bind:value={description} ></textarea>

<div class="row mb-2">
  <label class="col col-form-label" for="startDate">Start Date:</label>
  <input id="startDate" class="col col-form-input form-control" type="date" bind:value={start_date}/>
</div>
<div class="row mb-2">
  <label class="col col-form-label" for="startDate">End Date:</label>
  <input id="startDate" class="col col-form-input  form-control" type="date" bind:value={end_date} />
</div>
