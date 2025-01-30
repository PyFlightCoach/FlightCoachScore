import {describe, expect, it} from 'vitest';
import {getSites, FCSite} from '$lib/flight/box/box';


describe("Box", async () => {
    it("getSites", async () => {
        const sites = await getSites();
        expect(sites.length).toBeGreaterThan(0);
        expect(sites[0]).toBeInstanceOf(FCSite);        
        
    }, 10000);



})
