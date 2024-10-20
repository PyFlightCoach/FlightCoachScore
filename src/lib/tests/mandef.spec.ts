import { describe, expect, it } from 'vitest';

import {  split_arg_string } from '$lib/analysis/mandef';



describe('utility functions', () => {
	it('split_arg_string', () => {
		expect(split_arg_string('sp:10,rot:0.5')).toEqual({ sp: 10, rot: 0.5 });
	});
});
