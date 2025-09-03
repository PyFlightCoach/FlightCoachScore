<script lang="ts">
	import { compList } from '$lib/stores/contests';
	import { base } from '$app/paths';
  import {library} from '$lib/schedule/library';
	let group = $state('All');
	let category = $state('All');
  let categories = $derived($library.unique("category_name"));
	let comps = $derived(
		$compList.filter((c) => {
			switch (group) {
				case 'All':
					return true;
				case 'Active':
					return c.summary.is_open_now;
				case 'Open':
					return c.iCanEnter;
				case 'Entered':
					return c.iAmCompeting;
			}
		})
	);

</script>

{#snippet filterButton(name: string, description: string)}
    <button
        class="col btn btn-outline-secondary {group == name ? 'active' : ''}"
        onclick={() => {group = name;}}
        title={description}
      >
        {name}
      </button>
{/snippet}

<div class="col p-0">
	<div class="row p-2">
		<div class="col-auto">
			<div class="btn-group" role="group">
				{@render filterButton("All", `All competitions`)}
        {@render filterButton("Active", `Active competitions`)}
        {@render filterButton("Open", `Competitions you can enter`)}
        {@render filterButton("Entered", `Competitions you have entered`)}
			</div>
		</div>
		<div class="col">
			<div class="row">
				<label for="category-select" class="col-auto col-form-label">Category Filter:</label>
        <div class="col-auto">
				<select class="form-input form-select" id="category-select">
					{#each ['All', ...categories] as category}
						<option value={category} selected={group === category}>{category}</option>
					{/each}
				</select>
        </div>
			</div>
		</div>
	</div>
	<div class="row-auto table-responsive p-0">
		<table class="table table-bordered table-striped">
			<thead class="table-dark">
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
				{#each comps as comp}
					<tr>
						<td>{comp.summary.name}</td>
						<td>{comp.summary.comment}</td>
						<td>{comp.summary.directors?.map((d) => d.name)}</td>
						<td>{comp.summary.date_start || '-'}</td>
						<td>{comp.summary.date_end || '-'}</td>
						<td>{comp.summary.fa_version}</td>
						<td>{comp.summary.is_open_now ? 'Yes' : 'No'}</td>
						<td>{comp.summary.add_rules?.cd_and_self_add ? 'Public' : 'Contact CD'}</td>
						<td class="p-0 text-center"
							><a
								class="btn btn-outline-primary b-0"
								href={base + `/competition/load/?id=${comp.summary.id}`}
								data-sveltekit-preload-data="tap"
							>
								View
							</a></td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
