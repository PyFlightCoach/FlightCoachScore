<script lang="ts">
	import ResultRuleInput from '$lib/competitions/ResultRuleInput.svelte';
	import TextInput from '$lib/components/TextInput.svelte';
	import CheckInput from '$lib/components/CheckInput.svelte';
	import { activeComp, updateCDComps } from '$lib/stores/contests';
	
  import CompThingManager from '$lib/competitions/CompThingManager.svelte';

  

</script>


<CompThingManager whatAmI="competition" thing={$activeComp} />