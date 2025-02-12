<script lang="ts">
	// lifted from https://github.com/aknakos/sveltekit-plotly
	import Plotly from 'plotly.js-dist';
	import type {
		Data,
		Layout,
		Config,
		PlotlyHTMLElement,
		BeforePlotEvent,
		ClickAnnotationEvent,
		FrameAnimationEvent,
		LegendClickEvent,
		PlotMouseEvent,
		PlotHoverEvent,
		PlotRelayoutEvent,
		PlotRestyleEvent,
		PlotSelectionEvent,
		SliderEndEvent,
		SliderChangeEvent,
		SliderStartEvent,
		SunburstClickEvent
	} from 'plotly.js';

	let {
		id = 'plot-' + Math.floor(Math.random() * 100).toString(),
		data,
		layout = {},
		config = {},
		loaded = $bindable(false),
		reloadPlot = 0,
		onhover = () => {},
		onunhover = () => {},
		onclick = () => {},
		onselected = () => {},
		onrelayout = () => {}
	}: {
		id?: string;
		data: Record<string, any>[];
		layout?: Record<string, any>;
		config?: Record<string, any>;
		loaded?: boolean;
		reloadPlot?: number;
		onhover?: (e: PlotMouseEvent) => void;
		onunhover?: (e: PlotMouseEvent) => void;
		onclick?: (e: PlotMouseEvent) => void;
		onselected?: (e: PlotSelectionEvent) => void;
		onrelayout?: (e: PlotRelayoutEvent) => void;
	} = $props();

	function plotlyAction(
		node: HTMLDivElement,
		{
			data,
			layout,
			config,
			reloadPlot
		}: {
			data: Record<string, any>[];
			layout: Record<string, any>;
			config: Record<string, any>;
			reloadPlot: number;
		}
	) {
		$inspect(Plotly);
    let plotDiv: PlotlyHTMLElement | undefined;
		Plotly.newPlot(node, data, layout, config).then((plot: PlotlyHTMLElement) => {
			plot.on('plotly_hover', onhover);
			plot.on('plotly_unhover', onunhover);
			plot.on('plotly_click', onclick);
			plot.on('plotly_selected', onselected);
			plot.on('plotly_relayout', onrelayout);

			loaded = true;
			plotDiv = plot;
		});

		return {
			update: ({
				data,
				layout,
				config
			}: {
				data: Record<string, any>[];
				layout: Record<string, any>;
				config: Record<string, any>;
			}) => {
				loaded = false;
				return Plotly.react(node, data, layout, config).then(() => {
					console.debug('update ploty', data);
					loaded = true;
				});
			},
			destroy: () => {
				plotDiv?.removeAllListeners('plotly_hover');
				plotDiv?.removeAllListeners('plotly_unhover');
				plotDiv?.removeAllListeners('plotly_click');
				plotDiv?.removeAllListeners('plotly_selected');
				plotDiv?.removeAllListeners('plotly_relayout');
				loaded = false;
			}
		};
	}
</script>

<div
	style="height:100%; width:100%; overflow:hidden;"
	{id}
	use:plotlyAction={{ data, layout, config, reloadPlot }}
></div>
