<script lang="ts">
	import CompetitionSelect from '$lib/competitions/contests/CompetitionSelect.svelte';
	import { user } from '$lib/stores/user';
	import { activeComp } from '$lib/stores/contests';
</script>

<CompetitionSelect
	bind:competition={$activeComp}
	filterSubset={['All', 'Mine', 'Entered', 'Open']}
	actionSubset={['View', 'Enter']}
/>
