<script lang="ts">
	import { mans, rule } from '$lib/schedules/schedule_builder';
	import { canIEdit, ManoeuvreHandler } from '$lib/schedules/schedule_builder';
  import EditManoeuvre from './EditManoeuvre.svelte';

	let { activeManId = $bindable() } = $props();

	const addManoeuvre = () => {
		if (!mans) {
			$mans = [];
		}
		$mans.push(ManoeuvreHandler.empty('new'));
		activeManId = $mans.length - 1;
	};
</script>

<div class="row p-2 pt-0">

	<div class="table-responsive pt-2 text-nowrap text-center">
		<table class="table table-sm border align-middle">
			<thead>
				<tr>
					<th scope="col" class="col-auto"></th>
					<th scope="col" class="col-auto">name</th>
					<th scope="col" class="col-auto">long name</th>
					<th scope="col" class="col-auto">K</th>
          <th scope="col" class="col-auto"></th>
				</tr>
			</thead>
			<tbody>
				{#if $mans}
					{#each $mans as ol, i}
						<tr>
							<td><lead>{i + 1}</lead></td>
							{#if ol}
								<td class="p-0"
									><input
										type="text"
										class="form-control text-center"
										bind:value={ol.info.short_name}
                    disabled={!$canIEdit}
									/></td
								>
								<td class="p-0"
									><input
										type="text"
										class="form-control text-center"
										bind:value={ol.info.name}
                    disabled={!$canIEdit}
									/></td
								>
								<td class="p-0">
                  <input
										type="number"
										class="form-control text-center"
										bind:value={ol.info.k}
                    disabled={!$canIEdit}
										onchange={(e) => {
											ol.info.k = parseInt((e.target as HTMLInputElement).value);
										}}
									/>
                </td>
                <td role="button" onclick={() => {
                  if (activeManId == i) {
                    activeManId = undefined;
                  } else {
                    activeManId = i;
                  }
                }}>
                  {#if activeManId == i}
                    <i class="bi bi-chevron-up"></i>
                  {:else}
                    <i class="bi bi-chevron-down"></i>
                  {/if}
                </td>
							{/if}
						</tr>
						{#if activeManId === i}
							<tr>
                <td colspan="5" >
								<EditManoeuvre manoeuvre={$mans[activeManId]} canEdit={$canIEdit}/>
                </td>
							</tr>
						{/if}
					{/each}
				{/if}
				<tr>
					<td colspan="5" class="p-0"
						><button class="btn btn-outline-secondary w-100" onclick={addManoeuvre}
							>Add Manoeuvre</button
						></td
					>
				</tr>
			</tbody>
		</table>
	</div>
</div>
