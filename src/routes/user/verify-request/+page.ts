import { dbServer } from '$lib/api';
import { user } from '$lib/stores/user';
import { get } from 'svelte/store';

export async function load({ url }) {
	let email = url.searchParams.get('email');
	if (!email) {
		email = get(user)!.email;
	}

	console.debug(email);

	try {
		const r = await dbServer.post('auth/request-verify-token', { email: email });
		if (r.status == 202) {
			return{ request_result: `An email has been sent to ${email}. Please follow the instructions in that email to verify your account.` };
		}
		return{ request_result: `Verification for ${email} was rejected with code ${r.status}.` };
	} catch {
		return { request_result: `Verification for ${email} has failed.  Please try again later.` };
	}
}
