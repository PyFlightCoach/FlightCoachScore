<script lang="ts">
	import { ManSplit } from '$lib/analysis/splitting.svelte';
	import type { ScheduleLibrary } from '$lib/schedules';
	
	let {
		library,
		old_man,
    stopLevel=2,
		onselected = (new_man: ManSplit) => {}
	}: {
		library: ScheduleLibrary;
		old_man: ManSplit;
    stopLevel?: number;
		onselected?: (new_man: ManSplit) => void;
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

  

	const getKey = (level: number) => {
		return Object.keys(man)[level] as keyof typeof man;
	};

	const getEmpty = (level: number) => {
		const name = getKey(level).split('_')[0];
		return 'Select ' + name.charAt(0).toUpperCase() + name.slice(1);
	};

	const setValue = (level: number, value: string | undefined) => {
		man[getKey(level)] = value || getEmpty(level);
	};

	let level: number = $derived(getLevel(man));

  let sLevel: number = $derived(Math.min(level, stopLevel))


	$effect(() => {
		onselected(
			new ManSplit(
				level > 0 ? man.category_name : undefined,
				level > 1 ? man.schedule_name : undefined,
				level > 2
					? library
							.subset({ category_name: man.category_name, schedule_name: man.schedule_name })
							.only.manoeuvres.find((v) => v.short_name == man.manoeuvre_name)
					: undefined
			)
		);
	});



</script>

<div class="btn-group" style="width: 250px;">
	{#if level > 0}
		<button
			class="btn btn-outline-secondary"
			style="max-width: 50px;"
			onclick={() => {
				setValue(sLevel, undefined);
				setValue(sLevel - 1, undefined);
			}}
			title="Select Category">^</button
		>
	{/if}
	<select
		class="btn btn-outline-secondary"
		value={Object.values(man)[sLevel]}
		onchange={(e) => {
			setValue(sLevel, (e.target as HTMLSelectElement).value);
		}}
	>
		<option selected disabled value={getEmpty(sLevel)}>{getEmpty(sLevel)}</option>
		{#each getlists[sLevel]() as cat}
			<option value={cat}>{cat}</option>
		{/each}
	</select>
</div>
