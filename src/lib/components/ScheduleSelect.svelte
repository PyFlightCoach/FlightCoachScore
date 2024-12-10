<script lang="ts">
	import { library, loadKnowns, type Schedule, type Manoeuvre } from '$lib/schedules';
  loadKnowns();
	let {
		level = 'schedule',
		onselected
	}: {
		level: string;
		onselected: (schedule: Schedule, manoeuvre: Manoeuvre | undefined) => void;
	} = $props();

</script>

<ul class="dropdown-menu">
	{#each $library
    .unique('category_name')
    .map((catn) => $library.subset({ category_name: catn })) as catlib
  }
		<li>
			<div class="dropdown dropstart" >
				<button
					class="dropdown-item dropdown-toggle"
					onclick={(e) => {
						e.stopPropagation();
					}}
					data-bs-toggle="dropdown"
				>
          {catlib.first.rule_name}: {catlib.first.category_name}
				</button>
				<ul class="dropdown-menu dropdown-submenu" style="min-width: 1rem;">
					{#each catlib.schedules as sched}
						<li>
							{#if level == 'schedule'}
								<button class="dropdown-item" onclick={() => onselected(sched, undefined)}>
									{sched.schedule_name}
								</button>
							{:else}
								<button
									class="dropdown-item dropdown-toggle"

									data-bs-toggle="dropdown"
								>
									{sched.schedule_name}
								</button>
							{/if}
							<ul class="dropdown-menu dropdown-submenu">
								{#each sched.manoeuvres as m}
									<li>
										<button class="dropdown-item" onclick={() => onselected(sched, m)}>
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
