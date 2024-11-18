import {describe, expect, it} from 'vitest';
import {OBJ} from '$lib/components/plots/traces';
import {Point} from '$lib/analysis/geometry';


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



})
