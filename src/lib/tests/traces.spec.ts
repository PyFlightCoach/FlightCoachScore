import {describe, expect, it} from 'vitest';
import {OBJ} from '$lib/plots/traces';
import {Point} from '$lib/geometry';
import fs from 'fs';
import { makeVector } from 'apache-arrow';


describe("OBJ", () => {
    it("parse", () => {
        const contents =
        'v 0 0 0 \n' +
        'v 0 1 0 \n' +
        'v 1 0 0 \n' +
        'f 1//1 2//2 3//3';
        const obj = OBJ.parse(contents);

        expect(obj.vertices).toStrictEqual(
            [new Point(0,0,0), new Point(0,1,0), new Point(1,0,0)]
        );
        
        expect(obj.faces).toStrictEqual([[0,1,2]]);
        

    });


    it("parse_file", () => {
        const objfile = fs.readFileSync('static/ColdDraftF3APlane.obj', 'utf8');
        const obj = OBJ.parse(objfile.toString());
                
        expect (obj.vertices.length).toBe(1534);

    });


})

describe("trying some array stuff", () => {
    it("should add two matrices", () => {
        const a = makeVector(Int32Array.from([1,1,1]));
        const b = makeVector(Int32Array.from([1,1,1]));
        
    });
});