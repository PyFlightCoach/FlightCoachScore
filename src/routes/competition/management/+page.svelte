<script lang="ts">
	import ResultRuleInput from '$lib/competitions/ResultRuleInput.svelte';
	import TextInput from '$lib/components/TextInput.svelte';
	import CheckInput from '$lib/components/CheckInput.svelte';
	import { activeComp, updateCDComps } from '$lib/stores/contests';
	import { user, type DBUser } from '$lib/stores/user';
	import Stages from '$lib/competitions/Stages.svelte';
	import type {
		CompThingSummary,
		CompThingCreateUpdate,
		ResultRule,
    Competitor
	} from '$lib/competitions/compInterfaces';
  import CompetitorTable from '$lib/competitions/CompetitorTable.svelte';
	import { dbServer } from '$lib/api';
  import CompThingManager from '$lib/competitions/CompThingManager.svelte';

  

</script>


<CompThingManager whatAmI="competition" thing={$activeComp} />