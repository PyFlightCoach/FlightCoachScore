import { dbServer } from '$lib/api/api.js';
import { Flight } from '$lib/database/flight';
import { States } from '$lib/utils/state';
import { blockProgress, unblockProgress, loading } from '$lib/stores/shared.js';


export async function load({ url }) {
	loading.set(true);
	const flight_id = url.searchParams.get('flight_id');
	if (!flight_id) {
		return { status: 404, error: new Error('Flight ID not found') };
	}
	const flight = await Flight.load(flight_id);

	const mans = (
		await dbServer
			.get(`flight/view/${flight_id}`, blockProgress('Downloading Flight View'))
			.finally(() => {
				unblockProgress();
				loading.set(false);
			})
	).data.mans.map((v) => States.parse(v.flown));

	return { flight: flight, mans: mans };
}
