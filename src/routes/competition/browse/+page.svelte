<script lang="ts">
	import CompetitionSelect from '$lib/competitions/contests/CompetitionSelect.svelte';
	import { user } from '$lib/stores/user';
	import { activeComp } from '$lib/stores/contests';

	const filterSubset: ('All' | 'Mine' | 'Entered' | 'Open')[] = $derived(
		$user?.is_cd || $user?.is_superuser
			? ['All', 'Mine', 'Entered', 'Open']
			: ['All', 'Entered', 'Open']
	);
</script>

<CompetitionSelect 
  bind:competition={$activeComp} 
  {filterSubset} 
  actionSubset={['View', 'Enter']} 
/>
