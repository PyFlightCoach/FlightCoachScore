<script lang="ts">
	import {
		selManID,
		selectedResult,
		difficulty,
		truncate,
		running,
		runInfo,
		analyses
	} from '$lib/stores/analysis';
	import { colscale, redsColors, tealsColrs, yellColors } from '$lib/plots/styling';
	import { analyseManoeuvre } from '$lib/flight/analysis';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';

	interface Props {
		id: number;
	}

	let { id }: Props = $props();

	let ma = analyses[id];

	let isRunning = $derived($running[id]);
	let info = runInfo[id];

	let colours = $derived([yellColors, tealsColrs, redsColors][$difficulty - 1]);

	let scores = $derived($ma?.get_score($selectedResult!, $difficulty, $truncate));
	let intra = $derived(scores?.intra || 0);
	let inter = $derived(scores?.inter || 0);
	let positioning = $derived(scores?.positioning || 0);
	let score = $derived(scores?.total || 0);

	function activate_man(id: number, page: string) {
		$selManID = id;
		goto(base + '/flight/results/manoeuvre/' + page);
	}
</script>

<tr>
	<td>{$ma?.id}</td>
	<!-- svelte-ignore a11y_click_events_have_key_events -->

	<td role="button">
		<button class="btn btn-link p-0 link-dark" title="View {$ma?.name}" onclick={() => activate_man(id, '')}>
    {$ma?.name}
  </button>
	</td>

	<td>{$ma?.k}</td>

	{#if scores}
		<td
			class="text-center"
			style:background-color={colscale(intra, 6, colours)}
		>
    <button class="btn btn-link p-0 link-dark {isRunning ? 'disabled' : ''}" title="{$ma?.name} intra information" onclick={() => activate_man(id, 'intra')}>
			{intra.toFixed(2)}
    </button>
		</td>
		<td
			class="text-center"
			style:background-color={colscale(inter, 6, colours)}
      >
      <button class="btn btn-link p-0 link-dark {isRunning ? 'disabled' : ''}" title="{$ma?.name} inter information" onclick={() => activate_man(id, 'inter')}>
        {inter.toFixed(2)}
      </button>
    </td>
		<td
			class="text-center"
			style:background-color={colscale(positioning, 6, colours)}
		>
    <button class="btn btn-link p-0 link-dark {isRunning ? 'disabled' : ''}" title="{$ma?.name} positioning information" onclick={() => activate_man(id, 'positioning')}>
      {positioning.toFixed(2)}
    </button>
		</td>
	{:else}
		<td>-</td>
		<td>-</td>
		<td>-</td>
	{/if}

	{#if scores}
		<td
			class="text-center"
			style:background-color={colscale(10 - score, 10, colours)}
		>
			{score.toFixed(1)}
		</td>
	{:else}
		<td>-</td>
	{/if}

	{#if isRunning}
		<td class="bg-warning text-center">Busy</td>
	{:else}
  <td class="p-0 text-center">
		<button
			data-toggle="tooltip"
			title="Analyse {$ma?.name}"
			class="btn btn-sm btn-outline-secondary w-100"
			onclick={() => {
				analyseManoeuvre(id);
			}}
			ondblclick={() => {
				analyseManoeuvre(id, true);
			}}
		>
			Run
		</button>
  </td>
	{/if}

	<td>
    <div >
		<span class="small text-nowrap text-muted w-100 overflow-scroll">
			{$info}
			{#if $info && !isRunning && !$info.includes('Imported') && score == 0}
				<button
					tabindex="0"
					class=" btn btn-sm btn-link p-0"
          data-sveltekit-preload-data="tap"
					onclick={() => activate_man(id, 'alignment')}
					title="Failed analyses or unexpectedly low scores may be a result of a failed element alignment. Go to the the alignment page to check and fix it for this manoeuvre."
				>
					Check Alignment
				</button>
			{/if}
		</span>
  </div>
	</td>
</tr>
