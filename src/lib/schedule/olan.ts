import type { Direction, Orientation } from "./manoeuvre/positioning.svelte";


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
	olan: Olan;
	aresti: Figure;
	definition: object;
	manoeuvre: object;
	template: Record<string, never>;
};