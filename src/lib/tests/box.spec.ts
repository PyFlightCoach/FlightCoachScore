import {describe, expect, it} from 'vitest';
import {sites, FCSite} from '$lib/flight/box/fcsites';


describe("Box", async () => {
    it("getSites", async () => {
        const sites = await getSites();
        expect(sites.length).toBeGreaterThan(0);
        expect(sites[0]).toBeInstanceOf(FCSite);        
        
    }, 10000);



})
