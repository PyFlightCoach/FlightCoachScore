
import {type Heading} from '$lib/manoeuvre/positioning.svelte';


export interface IAJMan {
	name: string;
	id: number;
	schedule: object;
	schedule_direction: Heading | undefined;
	flown: object | object[];
	history: object | undefined;
	mdef: object | object[] | undefined;
	manoeuvre: object | undefined;
	template: object | object[] | undefined;
	corrected: object | undefined;
	corrected_template: object | object[] | undefined;
	scores: object | undefined;
};

export interface IAJson {
	origin: object;
	isComp: boolean;
	sourceBin: string | undefined;
	sourceFCJ: string | undefined;
	bootTime: string | undefined;
	mans: IAJMan[];
};
