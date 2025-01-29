import * as types from '$lib/interfaces';


export class Manoeuvre implements types.Manoeuvre {
  constructor(
    readonly uid: string,
    readonly elements: Record<string, types.Element>[],
    readonly exit_line: types.Line,
  ) {}
}
