<script lang="ts">
	import CompetitionSelect from '$lib/competitions/contests/CompetitionSelect.svelte';
	import { user } from '$lib/stores/user';
	import { activeComp } from '$lib/stores/contests';
  import type { ContestGroup } from '$lib/competitions/contests/contests';
	import * as nbc from '$lib/stores/navBarContents';

  nbc.reset();
	const filterSubset: ContestGroup[] = $derived(
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
