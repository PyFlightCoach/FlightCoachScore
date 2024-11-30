<script lang="ts">
	import { States } from '$lib/analysis/state';
	import Plot from 'svelte-plotly.js';
	import { points, ribbon } from '$lib/components/plots/traces';
	import { layout3d } from '$lib/components/plots/layouts';
	import DoubleSlider from '$lib/components/DoubleSlider.svelte';
	import colddraft from '$lib/components/plots/colddraft';
  import {createEventDispatcher} from 'svelte';
	export let flst: States;
	export let tpst: States | undefined = undefined;
	export let i: number | undefined = undefined;
	export let controls = [
		'slider',
		'play',
		'scale',
		'speed',
		'projection',
		'modelClick',
		'rangeEndClick',
		'rangeStartClick'
	];

	export let scale: number = 1;
	export let scaleType: string = 'range';
	export let speed = 50;
	export let range = [0, flst.data.length];
	export let greyUnselected: boolean = false;
	export let fixRange: boolean = false;

  const dispatch = createEventDispatcher();
	let scale_multiplier = 1;

	$: if (flst && fixRange) {
		range = [0, flst.data.length];
	}
	const getRange = (st: States) => {
		const _st = st.slice(range[0], range[1]);
		return Math.max(_st.range('x'), _st.range('y'), _st.range('z'));
	};
	$: rng = getRange(flst);
	$: _scale = scaleType === 'range' ? rng * 0.01 * scale : scale;

	const createRibbonTrace = (st: States | undefined, sc: number, min: number, max: number) => {
		if (!st) {
			return { type: 'mesh3d', visible: false };
		} else {
			max = max == -1 ? st.data.length : max;
			return ribbon(new States(st.data.slice(min, max)), sc);
		}
	};

	let layout = structuredClone(layout3d);

	const createModelTrace = (st: States | null, i: number | null, sc: number) => {
		if (st != null && i < st.data.length) {
			const fst = st.data[i];
			return colddraft
				.scale(sc * 0.3)
				.to_mesh3d(fst.pos, fst.att, { opacity: 1.0, hoverinfo: 'skip', name: 'fl model' });
		} else {
			return { type: 'mesh3d', visible: false };
		}
	};

	$: fl_ribbon = { ...createRibbonTrace(flst, _scale * scale_multiplier, ...range), name: 'fl' };
	$: tp_ribbon = { ...createRibbonTrace(tpst, _scale * scale_multiplier, ...range), name: 'tp' };
	$: fl_model = createModelTrace(flst, i, _scale * scale_multiplier);
	$: tp_model = createModelTrace(tpst, i, _scale * scale_multiplier);

	$: grey_ribbon1 =
		greyUnselected && range[0] > 0
			? {
					...createRibbonTrace(flst, _scale * scale_multiplier, 0, range[0]),
					opacity: 0.2,
					name: 'before'
				}
			: { type: 'mesh3d', visible: false };

	$: grey_ribbon2 =
		greyUnselected && range[1] < flst.data.length
			? {
					...createRibbonTrace(flst, _scale * scale_multiplier, range[1], flst.data.length),
					opacity: 0.2,
					name: 'after'
				}
			: { type: 'mesh3d', visible: false, name: 'grey2' };

	$: traces = [fl_ribbon, tp_ribbon, fl_model, tp_model, grey_ribbon1, grey_ribbon2];

	let player;

	const play = () => {
		player = setInterval(() => {
			i != null && i < flst.data.length ? i++ : (i = 0);
		}, speed);
	};

	const pause = () => {
		clearInterval(player);
		player = undefined;
	};

  const handleClick = (e: Event) => {
    const offset = {
      fl: range[0],
      tp: range[0],
      before: 0,
      after: range[1]
    }[e.detail.points[0].fullData.name as string];

    //const offset = e.detail.points[0].curveNumber <= 1 ? range[0] : 0;
    if (offset != undefined) {
      if (controls.includes('modelClick')) {
        i = offset + Math.floor(e.detail.points[0].pointNumber / 2);
      } else if (controls.includes('rangeEndClick')) {
        range[1] = offset + Math.floor(e.detail.points[0].pointNumber / 2);
      } else if (controls.includes('rangeStartClick')) {
        range[0] = offset + Math.floor(e.detail.points[0].pointNumber / 2);
      }
    }
  };

</script>

<div style:height="100%" id="parent">
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		style:height="100%"
		on:mousedown={() => {
			clearInterval(player);
		}}
		on:mouseup={() => {
			if (player) {
				play();
			}
		}}
	>
		{#if traces}
			<Plot
				data={traces}
				{layout}
				fillParent={true}
				on:click={handleClick}
        on:doubleclick={(e) => {
          handleClick(e);
          dispatch('doubleclick');
        }}
			/>
		{/if}
	</div>
	<div id="buttons">
		<div>
			{#if controls.includes('slider')}
				<DoubleSlider
					min={0}
					max={flst.data.length}
					bind:lhandle={range[0]}
					bind:rhandle={range[1]}
				/>
			{/if}
		</div>
		<div>
			{#if controls.includes('play')}
				{#if player}
					<button on:click={pause}>Pause</button>
				{:else}
					<button on:click={play}>Play</button>
				{/if}
			{/if}
		</div>
		<div>
			{#if controls.includes('scale')}
				<button
					on:click={() => {
						scale_multiplier = scale_multiplier + 0.1;
					}}>+</button
				>
			{/if}
		</div>
		<div>
			{#if controls.includes('scale')}
				<button
					on:click={() => {
						scale_multiplier = Math.max(0.2, scale_multiplier - 0.2);
					}}>-</button
				>
			{/if}
		</div>
		<div>
			{#if controls.includes('speed')}
				<button
					on:click={() => {
						speed = Math.min(200, speed * 1.6);
					}}>Slow</button
				>
			{/if}
		</div>
		<div>
			{#if controls.includes('speed')}
				<button
					on:click={() => {
						speed = Math.max(20, speed / 1.6);
					}}>Fast</button
				>
			{/if}
		</div>
		<div>
			{#if controls.includes('perspective')}
				<button
					on:click={() => {
						layout = structuredClone(layout3d);
						layout.scene.camera.projection.type =
							layout.scene.camera.projection.type == 'perspective' ? 'orthographic' : 'perspective';
						layout = layout;
					}}>{layout.scene.camera.projection.type}</button
				>
			{/if}
		</div>
	</div>
</div>

<style>
	#parent {
		position: relative;
	}
	#buttons {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 100%;
		display: grid;
		grid-template-columns: 1fr repeat(7, min-content);
	}
</style>
