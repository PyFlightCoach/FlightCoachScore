import type { Origin, ScheduleInfo, FCJManResult } from "./fcjson";
import type { Direction } from "$lib/manoeuvre/positioning.svelte";
import type { ManoeuvreResult } from "$lib/manoeuvre/scores";
import type { IManOpt, IManDef } from "$lib/manoeuvre/definition.svelte";


export interface MA {
    //name: str
    //id: int
    //schedule: ScheduleInfo
    //schedule_direction: Direction | None = None
    //flown: list[dict] | dict
    //history: dict[str, fcj.ManResult] | None = None
    //mdef: dict | list[dict] | None = None
    //manoeuvre: dict | list[dict] | None = None
    //template: list[dict] | dict | None = None
    //templates: list[dict] | dict | None = None
    //corrected: dict | None = None
    //corrected_template: list[dict] | dict | None = None
    //scores: dict | None = None
    name: string;
    id: number;
    schedule: ScheduleInfo;
    schedule_direction?: Direction;
    flown: Record<string, any>[];
    history?: Record<string, FCJManResult>;
    mdef?: IManDef | IManOpt[];
    manoeuvre?: Record<string, any> | Record<string, any>[];
    template?: Record<string, any> | Record<string, any>[];
    templates?: Record<string, any> | Record<string, any>[];
    corrected?: Record<string, any> ;
    corrected_template?: Record<string, any> | Record<string, any>[];
    scores?: Record<string, any>;
}


export interface AJson {
    //origin: fcj.Origin | None = None
    //isComp: bool
    //sourceBin: str | None = None
    //sourceFCJ: str | None = None
    //bootTime: datetime | None = None
    //mans: list[MA]
  origin: Origin;
  isComp: boolean;
  sourceBin?: string;
  sourceFCJ?: string;
  bootTime?: Date;
  mans: MA[];
}