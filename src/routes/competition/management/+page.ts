import { checkUser } from '$lib/stores/user';

import { dbServer } from '$lib/api';
import type { AddRule, CompThingSummary } from '$lib/competitions/compInterfaces.js';
import { faVersion } from '$lib/stores/shared.js';
import { get } from 'svelte/store';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import {activeComp} from '$lib/stores/contests';

export async function load({ url }) {
	const compID = url.searchParams.get('id');

	activeComp.set({
		name: '',
    comment: '',
		fa_version: get(faVersion),
		add_rules: {} as AddRule
	} as CompThingSummary);

	if (compID) {
		await dbServer
			.get(`/competition/${compID}`)
			.then((res) => {
        activeComp.set(res.data as CompThingSummary);
			})
			.catch(() => {
				alert(`Competition  ${compID} not found`);
				goto(base + '/competition/management');
			});
	}

	if (await checkUser(true)) {
		const users = await dbServer.get('users/list').then((res) => res.data.results);
		return { users};
	} else {
		goto('/');
	}
}
