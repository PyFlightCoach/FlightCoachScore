import * as units from "$lib/units";
import { ManInfo } from "./info.svelte";


export interface ICriteria {
  lookup: Record<string, object>;
  kind: string;
  min_bound: number | undefined;
  max_bound: number | undefined;
  limit: number | undefined;
}


export interface IDownGrade {
  name: string;
  measure: string;
  smoothers: string[];
  selectors: string[];
  criteria: ICriteria;
  display_name: string;
}

export interface IManParm {
  defaul: string | number;
  name: string;
  criteria: Record<string, ICriteria>;
  unit: units.BaseUnit;
  collectors: Record<string, never>;
  visibility: string | undefined;
}

export interface IElDef {
  name: string;
  Kind: string;
  props: object;
  dgs: Record<string, IDownGrade>
}

export interface IMD {
  mps: Record<string, IManParm>;
  eds: Record<string, IElDef>;
  box: object;
}

export interface IManDef extends IMD {
  info: ManInfo;
}

export interface IManOpt {
  options: IManDef[]
}


export class ManParm {
  defaul: string | number | undefined= $state();
  constructor (
    readonly name: string,
    readonly criteria: Record<string, ICriteria>,
    readonly unit: units.BaseUnit,
    readonly collectors: Record<string, never>,
    readonly visibility: string | undefined = undefined,
    defaul: string | number) {
      this.defaul = defaul;
    }

  static parse(data: IManParm) {
    return new ManParm(
      data.name,
      data.criteria,
      data.unit,
      data.collectors,
      data.visibility,
      data.defaul
    );
  }

}

