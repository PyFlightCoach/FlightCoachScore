<script lang="ts">
	import * as sp from '$lib/flight/splitting';
	import type { ScheduleLibrary } from '$lib/schedule/library';
	import { schedule_id } from '$lib/leaderboards/stores';
	
	let {
		library,
		old_man,
		stopLevel = 2,
    specialManoeuvres = ['Break', 'Landing'],
		onselected = (new_man: sp.Split) => {},
		ondeselect = () => {}
	}: {
		library: ScheduleLibrary;
		old_man: sp.Split;
		stopLevel?: number;
    specialManoeuvres?: string[];
		onselected?: (new_man: sp.Split) => void;
		ondeselect?: () => void;
	} = $props();

	let man: {
		category_name: string;
		schedule_name: string;
		manoeuvre_name: string;
	} = $state({
		category_name: old_man.category_name || 'Select Category',
		schedule_name: old_man.schedule_name || 'Select Schedule',
		manoeuvre_name: old_man.manoeuvre?.short_name || old_man.alternate_name || 'Select Manoeuvre'
	});

	const getLevel = (_man: Record<string, string>) => {
		if (man.category_name.startsWith('Select')) return 0;
		if (man.schedule_name.startsWith('Select')) return 1;
		if (man.manoeuvre_name.startsWith('Select')) return 2;
		return 3;
	};

	const getlists = [
		() => library!.unique('category_name'),
		() => library.subset({ category_name: man.category_name }).unique('schedule_name'),
		() => [
			...specialManoeuvres,
			...library
				.subset({ category_name: man.category_name, schedule_name: man.schedule_name })
				.only.manoeuvres.map((m) => m.short_name)
		]
	];

	const checkSelected = () => {
		const isMan = !specialManoeuvres.includes(man.manoeuvre_name);

		const spo: sp.Split = {
			category_name: level > 0 ? man.category_name : undefined,
			schedule_name: level > 1 ? man.schedule_name : undefined
		};

		if (level > 1 && isMan) {
			$schedule_id = library.subset(spo as Record<string, string>).first.schedule_id;
		}

		if (level > 2) {
			switch (man.manoeuvre_name) {
				case 'Break':
          spo.manoeuvre = undefined;
					spo.alternate_name = 'Break';
					break;
				case 'Landing':
          spo.manoeuvre = undefined;
					spo.alternate_name = 'Landing';
					break;
				default:
					spo.manoeuvre = library
						.subset({ category_name: man.category_name, schedule_name: man.schedule_name })
						.only.manoeuvres.find((v) => v.short_name == man.manoeuvre_name);
			}
		}

		if (level > stopLevel) onselected(spo);
	};

	const getKey = (level: number) => {
		return  Object.keys(man)[level] as keyof typeof man ;
	};

	const getEmpty = (level: number) => {
		const name = getKey(level).split('_')[0];
		return 'Select ' + name.charAt(0).toUpperCase() + name.slice(1);
	};

	const setValue = (level: number, value: string | undefined) => {
		man[getKey(level)] = value || getEmpty(level);
		checkSelected();
	};

	let level: number = $derived(getLevel(man));

	let sLevel: number = $derived(Math.min(level, stopLevel));



</script>

<div class="btn-group">
	{#if level > 0}
		<button
			class="btn btn-outline-secondary"
			onclick={() => {
				setValue(sLevel, undefined);
				setValue(sLevel - 1, undefined);
				ondeselect();
			}}
			title="Go back to {getKey(sLevel - 1).split('_')[0]} selection"
			aria-label="Deselect"><span><i class="bi-arrow-90deg-left"></i></span></button
		>
	{/if}

	<button
		class="btn btn-outline-secondary dropdown-toggle"
		data-bs-toggle="dropdown"
		aria-expanded="false"
		aria-label="Toggle Dropdown"
		title="Select {man[getKey(sLevel - 1)]} {getKey(sLevel).split('_')[0]}"
	>
    {#if ["Takeoff", "Landing", "Break"].includes(man.manoeuvre_name)}
        {man.manoeuvre_name}
      {:else}
        {man[getKey(sLevel)]}
      {/if}
	</button>
	<ul class="dropdown-menu">
		{#each getlists[sLevel]() as cat}
			<li>
				<button
					class="dropdown-item {specialManoeuvres.includes(cat) ? 'bg-secondary' : ''}"
					onclick={(e) => {
						setValue(Math.min(level, stopLevel), cat);
						if (level <= stopLevel) {
							e.stopPropagation();
						}
					}}
				>
					{cat}
				</button>
			</li>
		{/each}
	</ul>
</div>
