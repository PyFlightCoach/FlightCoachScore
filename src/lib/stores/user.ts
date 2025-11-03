import { writable, type Writable } from 'svelte/store';
import { dbServer, formDataFromDict } from '$lib/api/api';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { library, loadSchedules } from '$lib/schedule/library';
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

export async function getUser(userId: string) {
  return dbServer.get(`users/${userId}`).then((res) => {
    return res.data as DBUser;
  });
}

export const user: Writable<DBUser | undefined> = writable();

export const users: Writable<DBUser[]> = writable([]);

class UserCheckInterval {
  private interval: ReturnType<typeof setInterval> | undefined=undefined;
  constructor(readonly duration=60000) {}

  start() {
    this.stop();
    this.interval = setInterval(() => {
      dbServer.get('users/me').catch(() => {
        console.log('Session expired, logging out');
        user.set(undefined);
      });
    }, this.duration);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}

const interval = new UserCheckInterval();


user.subscribe((u) => {
  if (u) {
    interval.start();
  } else {
    interval.stop();
  }
});


export async function postLoginUser() {
	await Promise.all([
		loadSchedules({ owner: get(user)?.email }),
	]);
}

export async function postLogoutUser() {
	user.set(undefined);
	library.set(get(library).subset({ owner: 'admin@fcscore.org' }));
}

export async function loginUser(email: string, password: string) {
	await dbServer
		.post(
			'auth/jwt/login',
			formDataFromDict({
				username: email,
				password: password
			})
		)
		.then(() => dbServer.get('users/me'))
		.then((res) => {
			console.log('Login successful');
			user.set(res.data);
		})
		.then(postLoginUser);
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
			//goto(resolve('/'));
		});
}

export async function checkUser(
	require_cd: boolean = false,
	require_super: boolean = false,
	alertFail: boolean = true
) {
	return dbServer
		.get('users/me')
		.then((res) => {
			const me = res.data as DBUser;
			user.set(me);
			if (require_super && !me.is_superuser) {
				if (alertFail) {
					alert('You need to be a superuser to perform this action');
				}
				throw new Error('Not a superuser');
			} else if (require_cd && !me.is_cd && !me.is_superuser) {
				if (alertFail) {
					alert('You need to be a CD to perform this action');
				}
				throw new Error('Not a CD');
			} else if (!me.is_verified) {
				if (alertFail) {
					if (confirm('Please verify your email address first. Resend verification email?')) {
						goto(resolve('/user/verify-request/') + '?email=' + me.email);
					}
				}
				throw new Error('Email not verified');
			} else {
				return true;
			}
		})
		.catch(() => {
			if (alertFail) {
				logoutUser().then(() => {
					if (confirm('You need to log in to perform this action, log in now?')) {
						goto(resolve('/user/login'));
					}
				});
			}
			throw new Error('Not logged in');
		});
}


