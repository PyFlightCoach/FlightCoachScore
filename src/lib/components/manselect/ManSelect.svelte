<script lang="ts">
	import * as sp from '$lib/analysis/splitting';
	import type { ScheduleLibrary } from '$lib/schedules';
	import { schedule_id } from '$lib/stores/leaderboards';

	let {
		library,
		old_man,
		stopLevel = 2,
		onselected = (new_man: sp.Split) => {},
		ondeselect = () => {}
	}: {
		library: ScheduleLibrary;
		old_man: sp.Split;
		stopLevel?: number;
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
		manoeuvre_name: old_man.manoeuvre?.short_name || 'Select Manoeuvre'
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
		() =>
			library
				.subset({ category_name: man.category_name, schedule_name: man.schedule_name })
				.only.manoeuvres.map((m) => m.short_name)
	];

	const checkSelected = () => {
		if (level > 1) {
			$schedule_id = library.subset({
				category_name: man.category_name,
				schedule_name: man.schedule_name
			}).first.schedule_id;
		}
		const spo: sp.Split = {};
		if (level > 0) {
			spo.category_name = man.category_name;
		}
		if (level > 1) {
			spo.schedule_name = man.schedule_name;
		}
		if (level > 2) {
			spo.manoeuvre = library
				.subset({ category_name: man.category_name, schedule_name: man.schedule_name })
				.only.manoeuvres.find((v) => v.short_name == man.manoeuvre_name);
		}
		if (level > stopLevel) {
			onselected(spo);
		}
	};

	const getKey = (level: number) => {
		return Object.keys(man)[level] as keyof typeof man;
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
			title="Go back to {getKey(sLevel-1).split("_")[0]} selection"
			aria-label="Deselect"><span><i class="bi-arrow-90deg-left"></i></span></button
		>
	{/if}

	<button
		class="btn btn-outline-secondary dropdown-toggle"
		data-bs-toggle="dropdown"
		aria-expanded="false"
		aria-label="Toggle Dropdown"
    title="Select {man[getKey(sLevel-1)]} {getKey(sLevel).split("_")[0]}"
	>
		{man[getKey(sLevel)]}
	</button>
	<ul class="dropdown-menu">
		{#each getlists[sLevel]() as cat}
			<li>
				<button
					class="dropdown-item"
					onclick={(e) => {
						setValue(level, cat);
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
