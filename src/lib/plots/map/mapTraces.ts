import type { Origin } from '$lib/flight/fcjson';
import { drawBoxInWorld, getPointOnCentre } from '$lib/flight/box';
import type { GPS } from '$lib/utils/geometry';


export const originMapTraces = (origin: Origin, kind: string) => {

  const boxPoints = drawBoxInWorld(origin, kind);
  const centre = getPointOnCentre(origin);
	return [
		{
			lat: [origin.lat],
			lon: [origin.lng],
			type: 'scattermap',
			mode: 'markers',
			showlegend: false,
			marker: {
				size: 10,
				color: 'red'
			}
		},
		{
			lat: [origin.lat, centre.lat],
			lon: [origin.lng, centre.lon],
			type: 'scattermap',
			mode: 'lines',
			showlegend: false,
			line: {
				color: 'black',
				dash: 'dot',
				width: 1
			}
		},
		{
			lat: boxPoints.map((point) => point.lat),
			lon: boxPoints.map((point) => point.lon),
			type: 'scattermap',
			mode: 'lines',
			showlegend: false,
			line: {
				color: 'black',
				width: 2
			}
		}
	];
};


export const mapTrace = (gps: GPS[]) => { 
  return {
    lat: gps.map(g=>g.lat),
    lon: gps.map(g=>g.lon),
    type: 'scattermap',
    mode: 'lines',
    hovermode: false,
    showlegend: false
  };

  
}