<script lang="ts">
	import { mans } from '$lib/schedules/builder.svelte';
	import { canIEdit, addEmptyManoeuvre } from '$lib/schedules/builder.svelte';
	import EditManoeuvre from './EditManoeuvre.svelte';

	let { activeManId = $bindable() } = $props();

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
							<td><lead>{ol.dbManoeuvre?.index || i + 1}</lead></td>
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
								<td
									role="button"
									onclick={() => {
										if (activeManId == i) {
											activeManId = undefined;
										} else {
											activeManId = i;
										}
									}}
								>
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
								<td colspan="5">
									<EditManoeuvre
										id={activeManId}
										entry={i > 0 ? $mans[i - 1].info.end : undefined}
										canEdit={$canIEdit}
										ondelete={() => {
											activeManId = undefined;
											$mans.splice(i, 1);
										}}
									/>
								</td>
							</tr>
						{/if}
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>

{#if $canIEdit}
	<div class="row p-2 pt-0">
		<button
			class="btn btn-outline-secondary w-100"
			onclick={() => {
				addEmptyManoeuvre('new', $mans[$mans.length - 1].info.end );
			}}
		>
			Add Manoeuvre
		</button>
	</div>
{/if}
