import { ManParm, type IManParm } from '$lib/manoeuvre/definition.svelte';
import { analysisServer } from '$lib/api/api';
import { objmap } from '$lib/utils/arrays';

export interface IElementBuilder {
	args: string[];
	kwargs: Record<string, string | number | boolean>;
}

export class ElementBuilder {
	args: string[] = $state([]);
	kwargs: Record<string, string | number | boolean> = $state({});

	constructor(args: string[], kwargs: Record<string, string | number | boolean>) {
		this.args = args;
		this.kwargs = kwargs;
	}

  static parse(data: IElementBuilder) {
    return new ElementBuilder(data.args, data.kwargs);
  }

  static dump(data: ElementBuilder) {
    return {
      args: data.args,
      kwargs: data.kwargs
    } as IElementBuilder;
  }
}

export interface IManBuilder {
	rule: string;
	parameters: Record<string, IManParm>;
	element_builders: Record<string, IElementBuilder>;
}

export class ManBuilder {
	rule: string = $state('');
	parameters: Record<string, ManParm> = $state({});
	element_builders: Record<string, ElementBuilder> = $state({});

	constructor(
		rule: string,
		parameters: Record<string, ManParm>,
		element_builders: Record<string, ElementBuilder>
	) {
		this.rule = rule;
		this.parameters = parameters;
		this.element_builders = element_builders;
	}

	static parse(data: IManBuilder) {
		return new ManBuilder(
			data.rule,
			objmap(data.parameters, (_, p) => ManParm.parse(p)),
			objmap(data.element_builders, (_, e) => ElementBuilder.parse(e))
		);
	}

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
			.then((res) => ManBuilder.parse(res.data as IManBuilder))
	}
}
