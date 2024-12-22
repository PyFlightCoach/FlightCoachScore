<script lang="ts">
	const pages: Record<string, any> = {
		sequences: 'Modelling Aerobatic Manoeuvres',
		elements: 'Identifying the Principal Elements',
    scoring: 'Scoring Manoeuvres',
    visibility: 'Accounting for the judges view'
	};
</script>

<h1>Flight Coach Score Supplementary Information</h1>
<p>
  These pages are intended to help users get the most out of FCScore and to understand how the judging
	process works. It is supplementary to the information given in the help menu, which is available on
  some pages by clicking on the question mark icon in the navbar.
</p>

{#each Object.entries(pages) as [k, v]}
	<p><a class="link" href="info/{k}">{v}</a></p>
{/each}
