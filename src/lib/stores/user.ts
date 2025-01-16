import { writable, type Writable } from 'svelte/store';
import type { DBUser } from '$lib/database/interfaces';
import { get } from 'svelte/store';
import { dbServer } from '$lib/api';
import { goto } from '$app/navigation';
import { base } from '$app/paths';

export const user: Writable<DBUser | undefined> = writable();

const userCheckInterval: Writable<undefined | number> = writable();

export async function checkUser() {
	return dbServer
		.get('users/me')
		.then((res) => {
      const me = res.data as DBUser;
			user.set(me);
			if (me.is_verified) {
				return true;
			} else {
				if (confirm('Please verify your email address first. Resend verification email?')) {
					goto(base + '/user/verify-request/?email=' + me.email);
				}
				return false;
			}
		})
		.catch(() => {
			user.set(undefined);
			if (confirm('Your session has expired. Log in again?')) {
				goto(base + '/user/login');
			}
			return false;
		});
}

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
						console.debug(`${me.data.first_name} ${me.data.last_name} still logged in`);
					})
					.catch(() => {
						console.log('User logged out');
						user.set(undefined);
					});
			}, 1000 * 60)
		);
	}

  


});
