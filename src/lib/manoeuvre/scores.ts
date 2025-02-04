import { Point } from '$lib/utils/geometry';
import { objmap, sum } from '$lib/utils/arrays';
import { Criteria } from './definition.svelte';


export class Measurement {
  constructor(
    readonly value: number[],
    readonly expected: number,
    readonly unit: string,
    readonly direction: Point[],
    readonly visibility: number[]
  ) {}

  static parse(data: Record<string, any>) {
    return new Measurement(
      data.value,
      data.expected,
      Object.keys(data).includes('unit') ? data.unit : '',
      Object.values(data.direction).map((p) => new Point(p.x, p.y, p.z)),
      data.visibility
    );
  }
}


export class Result {
  constructor(
    readonly name: string,
    readonly measurement: Measurement,
    readonly raw_sample: number[],
    readonly sample: number[],
    readonly sample_keys: number[],
    readonly errors: number[],
    readonly dgs: number[],
    readonly keys: string[] | number[],
    readonly total: number,
    readonly criteria: Criteria
  ) {}
  static parse(data: Record<string, any>) {
    return new Result(
      data.name,
      Measurement.parse(data.measurement),
      data.raw_sample,
      data.sample,
      data.sample_keys,
      data.errors,
      data.dgs,
      data.keys,
      data.total,
      data.criteria
    );
  }

  factoredDG(difficulty: (v: number) => number) {
    if (this.dgs.length == 0) {
      return 0;
    }
    return sum(this.dgs.map((v) => difficulty(v)));
  }

  scale() {
    return this.measurement.unit.includes('rad') ? 180 / Math.PI : 1;
  }

  info() {
    const scale = this.scale();
    return this.keys.map((_k, i) => {
      const k = this.sample_keys[_k as number];
      return 'measurement = ' +
          (this.measurement.value[k] * scale).toFixed(2) +
          '<br>error = ' +
          (this.errors[i] * scale).toFixed(1).toString() +
          '<br>visibility = ' +
          this.measurement.visibility[k].toFixed(2).toString() +
          '<br>downgrade = ' +
          this.dgs[i].toFixed(2).toString();
    });
    
  }


}

export class Results {
  constructor(
    readonly name: string,
    readonly data: Record<string, Result>,
    readonly summary: Record<string, number[]>,
    readonly total: number
  ) {}

  static parse(data: Record<string, any>) {
    return new Results(data.name, objmap(data.data, Result.parse), data.summary, data.total);
  }

  factoredDG(difficulty: (v: number) => number, trunc = false) {
    if (Object.values(this.data).length == 0) {
      return 0;
    }
    let res = sum(Object.values(this.data).map((v) => v.factoredDG(difficulty)));
    if (trunc) {
      res = Math.floor(res * 2) / 2;
    }
    return res;
  }

  values() {
    return Object.fromEntries(Object.entries(this.data).map(([k, v])=>[k, v.total]));
  }

}

export class ElementsResults {
  constructor(
    readonly data: Record<string, Results>,
    readonly summary: Record<string, number[]>,
    readonly total: number
  ) {}

  static parse(data: Record<string, any>) {
    return new ElementsResults(objmap(data.data, Results.parse), data.summary, data.total);
  }

  all_fields() {
    const af: string[] = [];
    Object.values(this.data).forEach((results) => {
      Object.values(results.data).forEach((result) => {
        af.push(result.name);
      });
    });
    return Array.from(new Set(af));
  }

  field_totals () {
    const fields = Object.fromEntries(this.all_fields().map(k=>[k, 0]));
    Object.values(this.data).forEach(results => {
      Object.entries(results.data).forEach(([k, v]) => {
        fields[k] = fields[k] + v.total;
      });
    });
    return fields;
  }

  get_downgrades(field = 'Total') {
    const scores: Record<string, number> = {};
    Object.entries(this.data).forEach(([k, v]) => {
      if (field == 'Total') {
        scores[k] = v.total;
      } else if (field in v.data) {
        scores[k] = v.data[field].total;
      } else {
        scores[k] = 0;
      }
    });

    return scores;
  }

  check_field(field = 'Total') {
    const scores: Record<string, boolean> = {};
    Object.entries(this.data).forEach(([k, v]) => {
      if (field == 'Total') {
        scores[k] = true;
      } else if (field in v.data) {
        scores[k] = true;
      } else {
        scores[k] = false;
      }
    });

    return scores;
  }

  summaries() {
    const summaries: Record<string, Record<string, number | undefined>> = {};
    const allfields: string[] = this.all_fields();

    Object.entries(this.data).forEach(([k, v]) => {
      summaries[k] = {};
      allfields.forEach((f) => {
        if (f in v.data) {
          summaries[k][f] = v.data[f].total;
        } else {
          summaries[k][f] = undefined;
        }
      });
      summaries[k]['Total'] = v.total;
    });
    return summaries;
  }



  factoredDG(difficulty: (v: number) => number, trunc = false) {
    if (trunc) {
      return sum(Object.values(this.data).map((v) => Math.floor(v.factoredDG(difficulty) * 2) / 2));
    } else {
      return sum(Object.values(this.data).map((v) => v.factoredDG(difficulty)));
    }
  }
}

export class ManoeuvreResult {
  constructor(
    readonly inter: Results,
    readonly intra: ElementsResults,
    readonly positioning: Results,
    readonly summary: Record<string, number>,
    readonly score: number
  ) {}
  static parse(data: Record<string, any>) {
    return new ManoeuvreResult(
      Results.parse(data.inter),
      ElementsResults.parse(data.intra),
      Results.parse(data.positioning),
      data.summary,
      data.score
    );
  }
}
