import { writable, type Writable } from 'svelte/store';
import type { DBUser } from '$lib/database/interfaces';
import { get } from 'svelte/store';
import { dbServer } from '$lib/api';
import { goto } from '$app/navigation';
import {base} from '$app/paths';

export const user: Writable<DBUser | undefined> = writable();

const userCheckInterval: Writable<undefined | number> = writable();

user.subscribe((value) => {
	if (get(userCheckInterval)) {
		clearInterval(get(userCheckInterval));
	}
	if (value) {
		userCheckInterval.set(
			setInterval(() => {
				dbServer
					.get('users/me')
					.then((me) => {
						console.log(`${me.first_name} ${me.last_name} still logged in`);
					})
					.catch(() => {
            console.log('User logged out');
            alert('Your session has expired. Please log in again.');
						user.set(undefined);
            goto(base + '/user/login');
					});
			}, 1000 * 60)
		);
	}
});
