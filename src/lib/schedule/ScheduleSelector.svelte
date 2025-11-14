<script lang="ts">
  import {library} from '$lib/schedule/library';
	import type { DBSchedule } from './db';

  let {
    onselected = ()=>{},
    category = $bindable("All"),
    owner = $bindable("All")
} : {
    onselected?: (schedule: DBSchedule) => void;
    category?: string;
    owner?: string;
  } = $props();

  let categories = $derived($library.unique('category_name'));
    
  let owners = $derived($library.unique('owner_name'));
  
  let schedules = $derived.by(() => {
    const filter = {...(category !== 'All' ? {category_name: category} : {}), ...(owner !== 'All' ? {owner_name: owner} : {})};
    return $library.subset(filter);
  });

  
</script>


<table class="table table-bordered table-striped table-sm text-center">
  <thead class="table-dark">
    <tr>
      <th class="p-0">
        <select class="form-select form-select-sm" id="selectOwner" bind:value={owner}>
          <option value="All">Select Owner</option>
          {#each owners as own}
            <option value={own}>{own}</option>
          {/each}
        </select>
      </th>
      <th class="p-0">
        <select class="form-select form-select-sm" id="selectCategory"  bind:value={category}>
          <option value="All">Select Category</option>
          {#each categories as cat}
            <option value={cat}>{cat}</option>
          {/each}
        </select>
      </th>
      <th>Type</th>
      <th>Schedule</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    {#each schedules.schedules as sched}
      <tr>
        <td>{sched.owner_name}</td>
        <td>{sched.category_name}</td>
        <td>Known</td>
        <td>{sched.schedule_name}</td>
        <td class="p-0"><button
            class="btn btn-outline-secondary p-1 b-0"
            onclick={() => {
              onselected(sched);
            }}
          >
            Select
        </button></td>
      </tr>
    {/each}
  </tbody>
</table>