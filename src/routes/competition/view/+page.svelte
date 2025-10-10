<script lang="ts">
	
  import ViewCompetition from '$lib/competitions/ViewCompetition.svelte';
	import { navBarContents, NavBarContents } from '$lib/stores/navBarContents';


  $navBarContents = new NavBarContents(
		[
			{
				name: 'Results',
				icon: 'bi-trophy',
				title: 'Show results table'
			},
			{
				name: 'Running Order',
				icon: 'bi-list-ol',
				title: 'Show running order table'
			}
		]
	).activate(0);
  
  let display = $derived($navBarContents.first as "Results" | "Running Order");

</script>

<ViewCompetition {display} />
