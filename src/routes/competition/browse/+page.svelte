<script lang="ts">
	import { base } from '$app/paths';
  import {compList} from '$lib/stores/contests';

</script>

<div class="table-responsive">
<table class="table table-bordered table-striped ">
  <thead  class="table-dark">
    <tr>
      <th>Name</th>
      <th>Comment</th>
      <th>Owner</th>
      <th>Start Date</th>
      <th>End Date</th>
      <th>FA Version</th>
      <th>Open</th>
      <th>Entry</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    {#each $compList as comp}
      <tr>
        <td>{comp.summary.name}</td>
        <td>{comp.summary.comment}</td>
        <td>{comp.summary.directors?.map(d=>d.name) }</td>
        <td>{comp.summary.date_start || "-"}</td>
        <td>{comp.summary.date_end || "-"}</td>
        <td>{comp.summary.fa_version}</td>
        <td>{comp.summary.is_open_now ? "Yes" : "No"}</td>
        <td>{comp.summary.add_rules?.cd_and_self_add ? "Public" : "Contact CD"}</td>
        <td class="p-0 text-center"><a class="btn btn-outline-primary b-0" href={`${base}/competition/load/?id=${comp.summary.id}`}>Open</a></td>
      </tr>
    {/each}
  </tbody>
</table>
</div>