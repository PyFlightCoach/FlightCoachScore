import { writable, type Writable } from 'svelte/store';
import type { DBUser } from '$lib/interfaces';
import { get } from 'svelte/store';
import { dbServer } from '$lib/api';
import { goto } from '$app/navigation';
import { base } from '$app/paths';

export const user: Writable<DBUser | undefined> = writable();

const userCheckInterval: Writable<undefined | number> = writable();

export async function checkUser(require_cd: boolean=false, require_super: boolean=false) {

  return dbServer.get('users/me')
		.then((res) => {
      const me = res.data as DBUser;
			user.set(me);
      if (require_super && !me.is_superuser) {
        alert('You need to be a superuser to perform this action');
        return false;
      } else if (require_cd && !me.is_cd) {
        alert('You need to be a CD to perform this action');
        return false;
      } else if (!me.is_verified) {
				if (confirm('Please verify your email address first. Resend verification email?')) {
					goto(base + '/user/verify-request/?email=' + me.email);
				}
				return false;
			} else {
        return true;
      }
		})
		.catch(() => {
			user.set(undefined);
			if (confirm('You need to log in to perform this action, log in now?')) {
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
