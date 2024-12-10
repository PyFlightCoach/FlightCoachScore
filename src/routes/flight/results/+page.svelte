<script lang="ts">
	import AnalysisSummary from './AnalysisSummary.svelte';
	import { totalScore, bin, selectedResult, fa_versions, bootTime } from '$lib/stores/analysis';
	import navBarContents from '$lib/stores/navBarContents';
	import AnalysisMenu from './ResultsMenu.svelte';
	import ToggleButton from '$lib/components/ToggleButton.svelte';
	import { activeFlight, dataSource } from '$lib/stores/shared';
	import { file } from 'jszip';

	$navBarContents = AnalysisMenu;

	$: isNew = $bin && !$activeFlight;
	$: isMine = $activeFlight?.isMine;
</script>

<div class="col-md-5 align-self pt-2">
	<div class="row">
		<div class="col-4">
			<div class="input-group">
				<label for="version" class="input-group-text">Version:</label>
				<button
					class="btn btn-outline-secondary dropdown-toggle form-control-sm"
					type="button"
					data-bs-toggle="dropdown"
					aria-expanded="false"
					style:overflow="hidden"
				>
					{$selectedResult}
				</button>
				<ul class="dropdown-menu">
					{#each $fa_versions as version}
						<li>
							<ToggleButton bind:group={$selectedResult} value={version}>{version}</ToggleButton>
						</li>
					{/each}
				</ul>
			</div>
		</div>
		<div class="col-8">
			<p class="small">
        
        {#if $selectedResult}
          Showing results for 
          {#if $dataSource=='example'}
            the example
          {:else if $dataSource=='db'}
            {$activeFlight?.meta.name}'s
          {:else}
            your
          {/if}
          flight imported 
          {#if $bin}
            from a bin file. The flight logger was booted on {$bootTime || $activeFlight?.meta.date}.
          {:else}
            from a {$dataSource} file.
          {/if}
				{:else if $fa_versions.length == 0}
					Run some analyses to view result
				{/if}
			</p>
		</div>
	</div>
	<AnalysisSummary />
	<h2>Total Score = {$totalScore}</h2>
</div>
