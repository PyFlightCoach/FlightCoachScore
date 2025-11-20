<script lang="ts">
	import {ManSplit} from '$lib/flight/splitting';
	import type { ScheduleLibrary } from '$lib/schedule/library';
	import { schedule_id } from '$lib/leaderboards/stores';

	let {
		library,
		old_man = $bindable(),
		stopLevel = 2,
		specialManoeuvres = ['Break', 'Landing'],
    disabled=$bindable(false),  
    dropDirection = 'down',
		onselected = (new_man: ManSplit) => {},
		ondeselect = () => {}
	}: {
		library: ScheduleLibrary;
		old_man: ManSplit;
		stopLevel?: number;
		specialManoeuvres?: string[];
    disabled?: boolean;
    dropDirection?: 'down' | 'up' ;
		onselected?: (new_man: ManSplit) => void;
		ondeselect?: () => void;
	} = $props();

	let man = $state({
		category_name: 'Category',
		schedule_name: 'Schedule',
		manoeuvre_name: 'Manoeuvre'
	});

	$effect(() => {
		man = {
			category_name: old_man.category_name || 'Category',
			schedule_name: old_man.schedule_name || 'Schedule',
			manoeuvre_name: old_man.manoeuvre?.short_name || old_man.alternate_name || 'Manoeuvre'
		};
	});

	const getLevel = (_man: Record<string, string>) => {
		if (man.category_name == 'Category') return 0;
		if (man.schedule_name == 'Schedule') return 1;
		if (man.manoeuvre_name == 'Manoeuvre') return 2;
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

		const spo: ManSplit = {
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
		return Object.keys(man)[level] as keyof typeof man;
	};

	const getEmpty = (level: number) => {
		const name = getKey(level).split('_')[0];
		return name.charAt(0).toUpperCase() + name.slice(1);
	};

	const setValue = (level: number, value: string | undefined) => {
		man[getKey(level)] = value || getEmpty(level);
		checkSelected();
	};

	let level: number = $derived(getLevel(man));

	let sLevel: number = $derived(Math.min(level, stopLevel));
</script>

<div class="btn-group w-100 {dropDirection == 'up' ? 'dropup' : ''}" >
	
		{#if level > 0}
			<button
				class="col-auto btn btn-outline-secondary"
				onclick={() => {
					setValue(sLevel, undefined);
					setValue(sLevel - 1, undefined);
					ondeselect();
				}}
        {disabled}
				title="Go back to {getKey(sLevel - 1).split('_')[0]} selection"
				aria-label="Deselect"><span><i class="bi-arrow-90deg-left"></i></span></button
			>
		{/if}

		<button
			class="col btn btn-outline-secondary dropdown-toggle"
			data-bs-toggle="dropdown"
			aria-expanded="false"
			aria-label="Toggle Dropdown"
      {disabled}
			title="{man[getKey(sLevel - 1)]} {getKey(sLevel).split('_')[0]}"
		>
			{#if ['Takeoff', 'Landing', 'Break'].includes(man.manoeuvre_name)}
				{man.manoeuvre_name}
			{:else}
				{man[getKey(sLevel)]}
			{/if}
		</button>
		<ul class="dropdown-menu" style="max-height:300px; overflow-y:auto;">
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
