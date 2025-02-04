import type { Direction, Orientation } from "$lib/manoeuvre/positioning.svelte";
import type { IState } from "$lib/utils/state";
import type { IFigure } from "./aresti.svelte";
import type { IManDef, IManOpt } from "./definition.svelte";
import type { IManoeuvre } from "./raw.svelte";


export interface IOlan {
	draw: string[];
	rawfig: string;
	fig: object;
	inverted: boolean;
	prefix: object | undefined;
	suffix: object[];
	final: object | undefined;
	entry: Orientation;
	exit: Orientation;
	entry_direction: Direction;
	exit_downwind: boolean;
};



export interface ParseOlanResponse {
	olan: IOlan;
	aresti: IFigure;
	definition: IManDef | IManOpt;
	manoeuvre: IManoeuvre;
	template: IState[];
};