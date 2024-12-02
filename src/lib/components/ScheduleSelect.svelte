<script lang="ts">
	import { library, type Schedule, type Manoeuvre } from '$lib/schedules';

	let {
		level = 'schedule',
		onselected
	}: {
		level: string;
		onselected: (schedule: Schedule, manoeuvre: Manoeuvre | undefined) => void;
	} = $props();
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
							{#if level == 'schedule'}
								<button class="dropdown-item" onclick={() => onselected(schedule, undefined)}>
									{schedule.schedule_name}
								</button>
							{:else}
								<button
									class="dropdown-item dropdown-toggle"
									onclick={(e) => {
										e.stopPropagation();
									}}
									data-bs-toggle="dropdown"
								>
									{schedule.schedule_name}
								</button>
							{/if}
							<ul class="dropdown-menu dropdown-submenu">
								{#each schedule.manoeuvres as m}
									<li>
										<button class="dropdown-item" onclick={() => onselected(schedule, m)}>
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
