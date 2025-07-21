import { GPS } from '$lib/utils/geometry';
import data from './sites.json';
//https://www.flightcoach.org/ribbon/siteDB/sites.json

export class FCSite {
	constructor(
		readonly country: string,
		readonly region: string,
		readonly name: string,
		readonly box: string,
		readonly pilot: GPS,
		readonly center: GPS
	) {}

	get description() {
		return `${this.country}_${this.region}_${this.name}_${this.box}`;
	}

	get heading() {
		return GPS.sub(this.center, this.pilot);
	}
}

const getSites = () => {
	if (data) {
		const sites: FCSite[] = [];

		let country = '';
		let region = '';
		let name = '';

		data.slice(2).forEach((rC) => {
			country = rC.label;
			rC.children.forEach((rR) => {
				region = rR.label;
				rR.children.forEach((rN) => {
					name = rN.label;

					rN.children.forEach((rS) => {
						sites.push(
							new FCSite(
								country,
								region,
								name,
								rS.label,
								new GPS(
									parseFloat(rS.pilotGPS.lat),
									parseFloat(rS.pilotGPS.lng),
									parseFloat(rS.pilotGPS.alt)
								),
								new GPS(
									parseFloat(rS.centerGPS.lat),
									parseFloat(rS.centerGPS.lng),
									parseFloat(rS.centerGPS.alt)
								)
							)
						);
					});
				});
			});
		});

		return sites;
	} else {
		console.debug('Error loading sites');
		console.debug(sites);
		return [];
	}
};

export const sites: FCSite[] = getSites();

export function getShortlist(target: GPS) {
	return sites
		.sort((a, b) => {
			if (GPS.sub(a.pilot, target).length() > GPS.sub(b.pilot, target).length()) {
				return 1;
			} else {
				return -1;
			}
		})
		.slice(undefined, 4);
}
