import { dbServer } from '$lib/api';

export async function load({ url }) {
	return JSON.parse(
		await (await dbServer.post('auth/verify', { token: url.searchParams.get('token') })).text()
	);
}
