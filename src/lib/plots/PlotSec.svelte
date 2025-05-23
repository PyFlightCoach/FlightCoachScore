<script lang="ts">
	import { States } from '$lib/utils/state';
	import Plot from './Plotly.svelte';
	import { ribbon, boxtrace, plotCorners } from '$lib/plots/traces';
	import DoubleSlider from '$lib/plots/DoubleSlider.svelte';
	import colddraft from '$lib/plots/colddraft';
	
	const availableControls = [
		'slider',
		'play',
		'scale',
		'speed',
		'projection',
		'modelClick',
		'rangeEndClick',
		'rangeStartClick',
		'showBox'
	];

	let {
		flst,
		tpst = undefined,
		i = $bindable(undefined),
		controls = availableControls,
		exclude_controls = [],
		showBefore = false,
		showAfter = false,
		scale = 1,
		speed = $bindable(20),
		range = $bindable([0, flst.data.length]),
		greyUnselected = false,
		fixRange = false,
		showBox = $bindable(false),
		includeZero = $bindable(false),
		expand = 0,
		hideAxes = false,
		extraTraces = [],
		projection = 'perspective'
	}: {
		flst: States;
		tpst?: States | undefined;
		i?: number | undefined;
		controls?: string[];
		exclude_controls?: string[];
		showBefore?: boolean;
		showAfter?: boolean;
		scale?: number;
		speed?: number;
		range?: [number, number];
		greyUnselected?: boolean;
		fixRange?: boolean;
		showBox?: boolean;
		includeZero?: boolean;
		expand?: number;
		hideAxes?: boolean;
		extraTraces?: any[];
		projection?: 'perspective' | 'orthographic';
	} = $props();

	const showcontrols = $state(controls.filter((c) => !exclude_controls.includes(c)));

	let scale_multiplier = 5;
	//	$: if (flst && fixRange) {
	//		range = [0, flst.data.length];
	//	}
  
	const createRibbonTrace = (st: States | undefined, sc: number, min: number, max: number, color:string, opacity: number=1.0) => {
		if (!st) {
			return { type: 'mesh3d', visible: false };
		} else {
			max = max == -1 ? st.data.length : max;
			return { ...ribbon(new States(st.data.slice(min, max)), sc), hoverinfo: 'none', color, opacity };
		}
	};

	let layout = $derived({
		legend: { font: { size: 20 }, yanchor: 'top', y: 0.99, xanchor: 'left', x: 0.01 },
		margin: { l: 0, r: 0, t: 0, b: 0 },
		scene: {
			aspectmode: 'data',
			camera: {
				up: { x: 0, y: 0, z: 1 },
				center: { x: 0, y: 0, z: 0 },
				eye: { x: 0, y: -1.5, z: -1 },
				projection: { type: projection }
			},
      xaxis: {visible:!hideAxes},
			yaxis: {visible:!hideAxes},
			zaxis: {visible:!hideAxes}
		}
	});

	const toggleProjection = () => {
		projection = projection == 'perspective' ? 'orthographic' : 'perspective';
	};

	const createModelTrace = (st: States | undefined, i: number | undefined, sc: number, color: string, opacity: number=1.0) => {
		if (st && typeof i !== 'undefined' && i < st.data.length && st.data[i]) {
			const fst = st.data[i];
			return colddraft
				.scale(sc * 0.6)
				.to_mesh3d(fst.pos, fst.att, { opacity: opacity, hoverinfo: 'skip', name: 'fl model', color });
		} else {
			return { type: 'mesh3d', visible: false };
		}
	};

	const corners = $derived(plotCorners(flst, expand, includeZero));
	const fl_ribbon = $derived({
		...createRibbonTrace(flst, scale * scale_multiplier, ...range, 'grey', 1.0),
		name: 'fl'
	});
	const tp_ribbon = $derived({
		...createRibbonTrace(tpst, scale * scale_multiplier, ...range, 'grey', 0.5),
		name: 'tp'
	});
	const fl_model = $derived(createModelTrace(flst, i, scale * scale_multiplier, 'orange', 1.0));
	const tp_model = $derived(createModelTrace(tpst, i, scale * scale_multiplier, 'grey', 0.5));
	const grey_ribbon1 = $derived(
		greyUnselected && range[0] > 0
			? {
					...createRibbonTrace(flst, scale * scale_multiplier, 0, range[0], 'grey', 0.2),
					opacity: 0.2,
					name: 'before',
					color: 'grey',
					visible: showBefore
				}
			: { type: 'mesh3d', visible: false }
	);
	const grey_ribbon2 = $derived(
		greyUnselected && range[1] < flst.data.length
			? {
					...createRibbonTrace(flst, scale * scale_multiplier, range[1], flst.data.length, 'grey', 0.2),
					opacity: 0.2,
					name: 'after',
					color: 'grey',
					visible: showAfter
				}
			: { type: 'mesh3d', visible: false, name: 'grey2' }
	);
	const box = $derived(showBox ? boxtrace() : { type: 'mesh3d', visible: false });
	const traces = $derived([
		corners,
		fl_ribbon,
		tp_ribbon,
		fl_model,
		tp_model,
		grey_ribbon1,
		grey_ribbon2,
		box,
		...extraTraces
	]);

	let player: number | undefined = $state();

	const play = () => {
		player = setInterval(() => {
			i != undefined && i < flst.data.length ? i++ : (i = 0);
		}, speed);
	};

	const pause = () => {
		clearInterval(player);
		player = undefined;
	};

	const changeWhilePlaying = (fun: () => void) => {
		if (player) {
			pause();
			fun();
			play();
		} else {
			fun();
		}
	};

  $inspect(range);
</script>

<div
	class="container-fluid h-100 d-flex flex-column p-0"
	role="button"
	tabindex="0"
	onmousedown={() => {
		clearInterval(player);
	}}
	onmouseup={() => {
		if (player) {
			play();
		}
	}}
>
	<div class="col">
		{#if traces}
			<Plot
				data={traces}
				{layout}
				onclick={(e) => {
					console.log(e);
					if (e.points?.length) {
						const offset = {
							fl: range[0],
							tp: range[0],
							before: 0,
							after: range[1]
						}[e.points[0].fullData.name as string];

						//const offset = e.detail.points[0].curveNumber <= 1 ? range[0] : 0;
						if (offset != undefined) {
							if (showcontrols.includes('modelClick')) {
								i = offset + Math.floor(e.points[0].pointNumber / 2);
							} else if (showcontrols.includes('rangeEndClick')) {
								range[1] = offset + Math.floor(e.points[0].pointNumber / 2);
							} else if (showcontrols.includes('rangeStartClick')) {
								range[0] = offset + Math.floor(e.points[0].pointNumber / 2);
							}
						}
					}
				}}
			/>
		{/if}
	</div>

	<div class="col-auto d-flex flex-row justify-content-center">
		<div class="row w-100 justify-content-center">
			{#if showcontrols.includes('slider')}
				<div class="col" style="min-width:200px;">
					<DoubleSlider
						min={0}
						max={flst.data.length}
						bind:lhandle={range[0]}
						bind:rhandle={range[1]}
					/>
				</div>
			{/if}

			{#if showcontrols.includes('play')}
				{#if player}
					<button class="col-auto btn btn-outline-secondary" onclick={pause} aria-label="Pause">
						<i class="bi bi-pause"></i>
					</button>
				{:else}
					<button class="col-auto btn btn-outline-secondary" onclick={play} aria-label="Play">
						<i class="bi bi-play"></i>
					</button>
				{/if}
			{/if}

			{#if showcontrols.includes('scale')}
				<div class="col-auto btn-group p-0">
					<button
						class="btn btn-outline-secondary"
						onclick={() => {
							changeWhilePlaying(() => {
								scale_multiplier = scale_multiplier * 1.2;
							});
						}}
						title="Increase Wingspan">+</button
					>

					<button
						class="btn btn-outline-secondary"
						onclick={() => {
							changeWhilePlaying(() => {
								scale_multiplier = Math.max(0.2, scale_multiplier * 0.8);
							});
						}}
						title="Reduce Wingspan">-</button
					>
				</div>
			{/if}

			{#if showcontrols.includes('speed')}
				<div class="btn-group col-auto p-0">
					<button
						class="btn btn-outline-secondary"
						onclick={() => {
							changeWhilePlaying(() => {
								speed = Math.min(60, speed * 1.6);
							});
						}}
						aria-label="Slower"
						title="Slower"
					>
						<i class="bi bi-rewind"></i>
					</button>

					<button
						class="btn btn-outline-secondary"
						onclick={() => {
							changeWhilePlaying(() => {
								speed = Math.max(5, speed / 1.6);
							});
						}}
						aria-label="Faster"
						title="Faster"><i class="bi bi-fast-forward"></i></button
					>
				</div>
			{/if}

			{#if showcontrols.includes('projection')}
				<button class="col-auto btn btn-outline-secondary" onclick={toggleProjection}
					>{layout.scene.camera.projection.type}</button
				>
			{/if}
			{#if showcontrols.includes('showBox')}
				<input
					type="checkbox"
					class="col-auto btn-check"
					id="btn-check"
					autocomplete="off"
					bind:checked={showBox}
				/>
				<label class="col-auto btn btn-outline-secondary text-nowrap" for="btn-check"
					>Show Box</label
				>
			{/if}
		</div>
	</div>
</div>
