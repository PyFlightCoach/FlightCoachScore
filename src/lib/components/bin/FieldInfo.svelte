<script lang="ts">
	import { BinData } from '$lib/components/bin/bindata';

	export let binData: BinData | undefined;
</script>

<div class="table-responsive">
<table class="table table-bordered table-sm border-primary">
	<thead>
		<tr>
			<th>Name</th>
			<th>Length</th>
			<th colspan="100">Fields</th>
		</tr>
	</thead>
	<tbody>
		{#if binData}
			{#each Object.entries(binData) as [name, field]}
				<tr>
					<td>{name}</td>
					<td>{field.length}</td>
					{#each Object.keys(field) as col}
						<td>{col}</td>
					{/each}
				</tr>
			{/each}
		{/if}
	</tbody>
</table>
</div>



<style>
  th:first-child, td:first-child
{
  position:sticky;
  left:0px;
}


</style>