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
	import { colscale, redsColors, tealsColrs, yellColors } from '$lib/components/plots/styling';
	import { analyseManoeuvre } from '$lib/analysis/analysis';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import {} from '$lib/stores/analysis';

	export let id: number;

	let ma = analyses[id];

	$: isRunning = $running[id];
	let info = runInfo[id];

	$: colours = [yellColors, tealsColrs, redsColors][$difficulty - 1];

	$: scores = $ma?.get_score($selectedResult!, $difficulty, $truncate);
	$: intra = scores?.intra || 0;
	$: inter = scores?.inter || 0;
	$: positioning = scores?.positioning || 0;
	$: score = scores?.total || 0;

	function activate_man(id: number, page: string) {
		$selManID = id;
		goto(base + '/flight/results/manoeuvre/' + page);
	}
</script>

<tr>
	<td>{$ma?.id}</td>
	<!-- svelte-ignore a11y-click-events-have-key-events -->

	<td role="button" on:click={() => activate_man(id, '')}>
		{$ma?.name}
	</td>

	<td>{$ma?.k}</td>

	{#if scores}
		<td
			class="text-center"
			role="button"
			style:background-color={colscale(intra, 6, colours)}
			on:click={() => activate_man(id, 'intra')}
		>
			{intra.toFixed(2)}
		</td>
		<td
			class="text-center"
			role="button"
			style:background-color={colscale(inter, 6, colours)}
			on:click={() => activate_man(id, 'inter')}>{inter.toFixed(2)}</td
		>
		<td
			class="text-center"
			role="button"
			style:background-color={colscale(positioning, 6, colours)}
			on:click={() => activate_man(id, 'positioning')}
		>
			{positioning.toFixed(2)}
		</td>
	{:else}
		<td>-</td>
		<td>-</td>
		<td>-</td>
	{/if}

	{#if scores}
		<td
			class="text-center"
			role="button"
			on:click={() => activate_man(id, '')}
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
			on:click={() => {
				analyseManoeuvre(id);
			}}
			on:dblclick={() => {
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
				<a
					tabindex="0"
					on:keydown={() => activate_man(id, 'alignment')}
					href="#"
					type="link"
					role="button"
					class="text-sm"
					on:click={() => activate_man(id, 'alignment')}
					title="Failed analyses or unexpectedly low scores may be a result of a failed element alignment. Go to the the alignment page to check and fix it for this manoeuvre."
				>
					Check Alignment
				</a>
			{/if}
		</span>
  </div>
	</td>
</tr>
