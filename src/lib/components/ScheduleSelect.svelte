<script lang="ts">
	import { library, type Schedule, type Manoeuvre } from '$lib/schedules';
	
	let { manoeuvre, onselected }: { manoeuvre: Manoeuvre|undefined; onselected: (schedule: Schedule, manoeuvre: Manoeuvre) => void } = $props();
	
</script>

<ul class="dropdown-menu">
	{#each Object.values(library) as category}
		<li>
			<div class="dropdown dropend">
				<button
					class="dropdown-item dropdown-toggle"
					onclick={(e) => {
						e.stopPropagation();
					}}
					data-bs-toggle="dropdown"
				>
					{category.category_name}({category.rule_name})
				</button>
				<ul class="dropdown-menu dropdown-submenu">
					{#each Object.values(category.schedules!) as schedule}
						<li>
              <button
								class="dropdown-item dropdown-toggle"
								onclick={(e) => {e.stopPropagation();}}
                data-bs-toggle="dropdown"
							>
								{schedule.schedule_name}
							</button>
              <ul class="dropdown-menu dropdown-submenu">
              {#each schedule.manoeuvres as m}
                <li>
                <button
                  class="dropdown-item"
                  onclick={() => onselected(schedule, m)}
                >
                  {m.index}: {m.short_name}
                </button>
              </li>
              {/each}
              </ul>
						</li>
					{/each}
				</ul>
			</div>
		</li>
	{/each}
</ul>
