
export class Field {
	constructor(
		readonly name: string,
		readonly example: unknown,
		readonly type: string
	) {}
}

export class Schema {
	constructor(readonly fields: Record<string, Field>) {}

	static fromTemplate(template: Record<string, unknown>): Schema {
		return new Schema(
			Object.fromEntries(
				Object.entries(template).map(([name, example]) => [
					name,
					new Field(name, example, typeof example)
				])
			)
		);
	}
}
