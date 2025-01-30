import { ManParm } from "$lib/manoeuvre/definition.svelte";
import { analysisServer } from "$lib/api/api";

export class ElementBuilder {
  constructor(
    readonly args: string[],
    readonly kwargs: Record<string, string | number | boolean>
  ) {}

  static parse(data: Record<string, unknown>) {
    return new ElementBuilder(
      data.args as string[],
      data.kwargs as Record<string, string | number | boolean>
    );
  }
}

export class ManBuilder {
  constructor(
    readonly rule: string,
    readonly parameters: Record<string, ManParm>,
    readonly element_builders: Record<string, ElementBuilder>
  ) {}

  get comparisons() {
    const names = Object.keys(this.parameters).filter(
      (k) => this.parameters[k].criteria.kind == 'Comparison'
    );
    return Object.fromEntries(names.map((n) => [n, this.parameters[n]]));
  }

  get comparisonValues() {
    return Object.fromEntries(Object.entries(this.comparisons).map(([k, v]) => [k, v.defaul]));
  }

  static async load(rule_name: string) {
    return analysisServer
      .get(`builder/${rule_name}`)
      .then((res) => {
        const parameters = Object.fromEntries(
          Object.entries(res.data.parameters).map(([k, v]) => [
            k,
            ManParm.parse(v as Record<string, never>)
          ])
        );

        const element_builders = Object.fromEntries(
          Object.entries(res.data.element_builders).map(([k, v]) => [
            k,
            ElementBuilder.parse(v as Record<string, unknown>)
          ])
        );

        return new ManBuilder(rule_name, parameters, element_builders);
      })
      .catch((e) => {
        alert(`Error loading builder from analysis server ${e}`);
      });
  }
}