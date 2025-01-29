import { Results, Result } from '../schedules/scores';
import { Point } from './geometry';


export class ResInfo {
  constructor(
    readonly description: string,
    readonly kind: string,
		readonly element: string,
		readonly downgrade: number,
    readonly location: Point | undefined = undefined,
	) {}

  static parseResult(result: Result, minDg: number, kind:string, ) {
    const rinfos: ResInfo[] = [];
    for (let i = 0; i < result.dgs.length; i++) {
      if (result.dgs[i] > minDg) {
        rinfos.push(new ResInfo(
          result.name, 
          kind, 
          result.keys[i] as string, 
          result.dgs[i]
        ));
      }
    }
    return rinfos
  }

  static parseInterResults(results: Results, minDg: number) {
    const rinfos: ResInfo[] = [];
    Object.values(results.data).forEach((result: Result) => {
      ResInfo.parseResult(result, minDg, 'Inter').forEach((rinfo) => {
        rinfos.push(rinfo);
      });
    });
    return rinfos;
  }


}



export class ResultInfo {
	constructor(
		readonly element: string,
		readonly location: Point | undefined = undefined,
		readonly downgrades: Record<string, number> = {}
	) {}

	summary() {
		return Object.entries(this.downgrades)
			.map(([k, v]) => `${k}: ${v}`)
			.join(', ');
	}
}


export function parseInterResults(results: Results, minDg: number) {
	const rinfos: Record<string, ResultInfo> = {};

	Object.values(results.data).forEach((result: Result) => {
		for (let i = 0; i < result.dgs.length; i++) {
			if (result.dgs[i] > minDg) {
				if (!(result.keys[i] in rinfos)) {
					rinfos[result.keys[i]] = new ResultInfo(result.keys[i] as string);
				}
				rinfos[result.keys[i]].downgrades[result.name] = result.dgs[i];
			}
		}
	});
}
