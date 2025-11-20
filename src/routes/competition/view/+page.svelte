<script lang="ts">
	import {navBarContents} from '$lib/stores/navBarContents';
  import ViewCompetition from '$lib/competitions/ViewCompetition.svelte';
	//import { navBarContents, NavBarContents } from '../../navBarContents.svelte';

  
//  let display = $derived($navBarContents.first as "Results" | "Running Order");

</script>

<ViewCompetition display={$navBarContents.active as "Results" | "Running Order"} />
