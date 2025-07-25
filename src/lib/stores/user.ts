import { writable, type Writable } from 'svelte/store';
import { dbServer, formDataFromDict } from '$lib/api/api';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { library, loadSchedules } from '$lib/schedule/library';
import { loadNews, clearNews } from './shared';
import { requestActivity, clearActivity } from '$lib/stores/userActivity';
import { get } from 'svelte/store';

export interface DBUser {
	id: string;
	email: string;
	is_active: boolean;
	is_superuser: boolean;
	is_verified: boolean;
	first_name: string;
	last_name: string;
	country: string;
	country_emoji: string;
	joined_when: string;
	is_cd: boolean;
	is_fake: boolean;
}

export const user: Writable<DBUser | undefined> = writable();

export async function postLoginUser() {
  await Promise.all([
    loadSchedules({ owner: get(user)?.email }), 
    loadNews(),
    requestActivity()
  ])
}

export async function postLogoutUser() {
  user.set(undefined);
  library.set(get(library).subset({ owner: 'admin@fcscore.org' }));
  clearNews();
  clearActivity();
}


export async function loginUser(email: string, password: string) {
	await dbServer
		.post('auth/jwt/login', formDataFromDict({
      username: email,
      password: password
    }))
    .then(() => dbServer.get('users/me'))
		.then((res) => {
			console.log('Login successful');
			user.set(res.data);
		})
		.then(postLoginUser)
}


export async function logoutUser() {
	await dbServer
		.post('auth/jwt/logout')
		.then(() => {
			console.log('Logout successful');
		})
		.catch((error) => {
			console.error('Logout error:', error);
		})
		.finally(() => {			
			postLogoutUser();
      goto(base + '/');
		});
}

export async function checkUser(require_cd: boolean = false, require_super: boolean = false) {
	return dbServer
		.get('users/me')
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
			logoutUser().then(() => {
        if (confirm('You need to log in to perform this action, log in now?')) {
          goto(base + '/user/login');
        }
      });
			
			return false;
		});
}
