import { describe, expect, it } from 'vitest';

import {  split_arg_string, ManDef, ManOpt } from '$lib/schedules/mandef';
import { Server } from '$lib/api';

const server = new Server('http://localhost:5000');

//describe('mandef', async () => {
  
//  it('should parse a mdef', async ()=>{
//    const trgle = ManDef.parse(await server.get('f3a/p25/trgle/definition')); 
//    expect(trgle).toBeDefined();
//    expect(trgle).toBeInstanceOf(ManDef);
//  });
//
//  it('should parse a manopt', async ()=>{
//    const that = ManDef.parse(await server.get('f3a/p25/tHat/definition'));
//    expect(that).toBeDefined();
//    expect(that).toBeInstanceOf(ManOpt);
//  });
//});


describe('utility functions', () => {
	it('split_arg_string', () => {
		expect(split_arg_string('sp:10,rot:0.5')).toEqual({ sp: 10, rot: 0.5 });
	});
});
