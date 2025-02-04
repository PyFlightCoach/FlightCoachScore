<script lang="ts">
	import { States } from '$lib/utils/state';
	import Plot from 'svelte-plotly.js';
	import { ribbon, boxtrace } from '$lib/components/plots/traces';
	import DoubleSlider from '$lib/components/plots/DoubleSlider.svelte';
	import colddraft from '$lib/components/plots/colddraft';
	import { isFullSize } from '$lib/stores/analysis';

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
		'rangeStartClick',
		'showBox'
	];
  export let exclude_controls: string[] = [];
	export let showBefore: boolean = false;
	export let showAfter: boolean = false;
	export let scale: number = 1;
	export let speed = 20;
	export let range: [number, number] = [0, flst.data.length];
	export let greyUnselected: boolean = false;
	export let fixRange: boolean = false;
	export let showBox: boolean = false;
	export let includeZero: boolean = false;
	export let expand: number = 0;
  export let hideAxes: boolean = false;
  export let extraTraces: any[] = [];

  let showcontrols = controls.filter(c=>!exclude_controls.includes(c))

	let scale_multiplier = $isFullSize ? 15 : 5;

	$: if (flst && fixRange) {
		range = [0, flst.data.length];
	}

	const createRibbonTrace = (st: States | undefined, sc: number, min: number, max: number) => {
		if (!st) {
			return { type: 'mesh3d', visible: false };
		} else {
			max = max == -1 ? st.data.length : max;
			return { ...ribbon(new States(st.data.slice(min, max)), sc), hoverinfo: 'none' };
		}
	};

	let layout = {
		legend: { font: { size: 20 }, yanchor: 'top', y: 0.99, xanchor: 'left', x: 0.01 },
		//autosize: true,
		margin: { l: 0, r: 0, t: 0, b: 0 },
		scene: {
			aspectmode: 'data',
			camera: {
				up: { x: 0, y: 0, z: 1 },
				center: { x: 0, y: 0, z: 0 },
				eye: { x: 0, y: -2, z: -1 },
				projection: { type: 'perspective' }
			},
			xaxis: {visible:!hideAxes},
			yaxis: {visible:!hideAxes},
			zaxis: {visible:!hideAxes},
			aspectratio: {}
		}
	};

	const updateLayout = (sts: States, _zero: boolean, _expand: number) => {
		let newlayout = structuredClone(layout);
		const ranges = {
			x: sts.plotRange('x', _zero, _expand),
			y: sts.plotRange('y', _zero, _expand),
			z: sts.plotRange('z', _zero, _expand)
		};

		newlayout.scene.xaxis.range = ranges.x ;
		newlayout.scene.yaxis.range = ranges.y ;
		newlayout.scene.zaxis.range = ranges.z ;
		newlayout.scene.aspectmode = 'manual';

		const max_range = Math.max(
			ranges.x[1] - ranges.x[0],
			ranges.y[1] - ranges.y[0],
			ranges.z[1] - ranges.z[0]
		);
		//
		newlayout.scene.aspectratio = {
			x: (ranges.x[1] - ranges.x[0]) / max_range,
			y: (ranges.y[1] - ranges.y[0]) / max_range,
			z: (ranges.z[1] - ranges.z[0]) / max_range
		};
		return newlayout;
	};

	$: layout = updateLayout(flst, includeZero, expand);

	const toggleProjection = () => {
		console.debug('toggling projection');
		const newlayout = structuredClone(layout);
		newlayout.scene.camera.projection.type =
			layout.scene.camera.projection.type == 'perspective' ? 'orthographic' : 'perspective';
		layout = newlayout;
	};

	const createModelTrace = (st: States | undefined, i: number | undefined, sc: number) => {
		if (st && typeof i !== 'undefined' && i < st.data.length && st.data[i]) {
			const fst = st.data[i];
			return colddraft
				.scale(sc * 0.6)
				.to_mesh3d(fst.pos, fst.att, { opacity: 1.0, hoverinfo: 'skip', name: 'fl model' });
		} else {
			return { type: 'mesh3d', visible: false };
		}
	};

	$: box = showBox ? boxtrace() : { type: 'mesh3d', visible: false };
	$: fl_ribbon = { ...createRibbonTrace(flst, scale * scale_multiplier, ...range), name: 'fl' };
	$: tp_ribbon = { ...createRibbonTrace(tpst, scale * scale_multiplier, ...range), name: 'tp' };
	$: fl_model = createModelTrace(flst, i, scale * scale_multiplier);
	$: tp_model = createModelTrace(tpst, i, scale * scale_multiplier);

	$: grey_ribbon1 =
		greyUnselected && range[0] > 0
			? {
					...createRibbonTrace(flst, scale * scale_multiplier, 0, range[0]),
					opacity: 0.2,
					name: 'before',
					color: 'grey',
					visible: showBefore
				}
			: { type: 'mesh3d', visible: false };

	$: grey_ribbon2 =
		greyUnselected && range[1] < flst.data.length
			? {
					...createRibbonTrace(flst, scale * scale_multiplier, range[1], flst.data.length),
					opacity: 0.2,
					name: 'after',
					color: 'grey',
					visible: showAfter
				}
			: { type: 'mesh3d', visible: false, name: 'grey2' };

	$: traces = [box, fl_ribbon, tp_ribbon, fl_model, tp_model, grey_ribbon1, grey_ribbon2, ...extraTraces];

	let player: number | undefined;

	const play = () => {
		player = setInterval(() => {
			i != undefined && i < flst.data.length ? i++ : (i = 0);
		}, speed);
	};

	const pause = () => {
		clearInterval(player);
		player = undefined;
	};

	const changeWhilePlaying = (fun) => {
		if (player) {
			pause();
			fun();
			play();
		} else {
			fun();
		}
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
			if (showcontrols.includes('modelClick')) {
				i = offset + Math.floor(e.detail.points[0].pointNumber / 2);
			} else if (showcontrols.includes('rangeEndClick')) {
				range[1] = offset + Math.floor(e.detail.points[0].pointNumber / 2);
			} else if (showcontrols.includes('rangeStartClick')) {
				range[0] = offset + Math.floor(e.detail.points[0].pointNumber / 2);
			}
		}
	};
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="container-fluid h-100 d-flex flex-column p-0"
	on:mousedown={() => {
		clearInterval(player);
	}}
	on:mouseup={() => {
		if (player) {
			play();
		}
	}}
>
	<div class="col">
		{#if traces}
			<Plot data={traces} {layout} fillParent={true} on:click={handleClick} />
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
					<button class="col-auto btn btn-outline-secondary" on:click={pause} aria-label="Pause">
            <i class="bi bi-pause"></i>
          </button>
				{:else}
					<button class="col-auto btn btn-outline-secondary" on:click={play} aria-label="Play">
            <i class="bi bi-play"></i>
          </button>
				{/if}
			{/if}

			{#if showcontrols.includes('scale')}
				<div class="col-auto btn-group p-0">
					<button
						class="btn btn-outline-secondary"
						on:click={() => {
							changeWhilePlaying(() => {
								scale_multiplier = scale_multiplier * 1.2;
							});
						}} title="Increase Wingspan">+</button
					>

					<button
						class="btn btn-outline-secondary"
						on:click={() => {
							changeWhilePlaying(() => {
								scale_multiplier = Math.max(0.2, scale_multiplier * 0.8);
							});
						}} title="Reduce Wingspan">-</button
					>
				</div>
			{/if}

			{#if showcontrols.includes('speed')}
				<div class="btn-group col-auto p-0">
					<button
						class="btn btn-outline-secondary"
						on:click={() => {
							changeWhilePlaying(() => {
								speed = Math.min(60, speed * 1.6);
							});
						}} aria-label="Slower" title="Slower">
            <i class="bi bi-rewind"></i>
            </button
					>

					<button
						class="btn btn-outline-secondary"
						on:click={() => {
							changeWhilePlaying(() => {
								speed = Math.max(5, speed / 1.6);
							});
						}} aria-label="Faster" title="Faster"><i class="bi bi-fast-forward"></i></button
					>
				</div>
			{/if}

			{#if showcontrols.includes('projection')}
				<button class="col-auto btn btn-outline-secondary" on:click={toggleProjection}
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
