import { dbServer } from '$lib/api';
import { user } from '$lib/stores/user';
import { get } from 'svelte/store';

export async function load({ url }) {
	let email = url.searchParams.get('email');
	if (!email) {
		email = get(user)!.email;
	}

	console.log(email);
	try {
		await dbServer.post('auth/request-verify-token', { email: email });
		return {
			request_result: `An email has been sent to ${email}. Please follow the instructions in that email to verify your account.`
		};
	} catch {
		return { request_result: `Verification for ${email} has failed.  Please try again later.` };
	}
}