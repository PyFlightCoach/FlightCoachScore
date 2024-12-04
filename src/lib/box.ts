import {GPS} from '$lib/analysis/geometry'

//https://www.flightcoach.org/ribbon/siteDB/sites.json

export class FCSite {
  constructor(
    readonly country: string,
    readonly region: string,
    readonly name: string,
    readonly box: string,
    readonly pilot: GPS,
    readonly center: GPS,
  ) {}
}


export const getSites = async () => {
  const startTime = performance.now();
  const sitedata = await (await fetch('https://www.flightcoach.org/ribbon/siteDB/sites.json')).json();
  const sites: FCSite[] = [];
  const loadedTime = performance.now();
  let country = '';
  let region = '';
  let name = '';
  
  sitedata.slice(2).forEach(rC => {
    country = rC.label;
    rC.children.forEach(rR => {
      region = rR.label;
      rR.children.forEach(rN => {
        name = rN.label;

        rN.children.forEach(rS => {
          sites.push(new FCSite(
            country,
            region,
            name,
            rS.label,
            new GPS(rS.pilotGPS.lat, rS.pilotGPS.lng, rS.pilotGPS.alt),
            new GPS(rS.centerGPS.lat, rS.centerGPS.lng, rS.centerGPS.alt)
          ))

        });

      });
    })
  });
  const finishTime = performance.now();
  console.debug(`loading: ${loadedTime - startTime}ms, processing: ${finishTime - loadedTime}ms`);
  return sites;

};