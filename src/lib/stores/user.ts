import { writable, type Writable } from 'svelte/store';

export const user: Writable<
	| {
			id: string;
			email: string;
			is_active: string;
			is_superuser: boolean;
			is_verified: boolean;
			first_name: string;
			last_name: string;
			country: string;
			country_emoji: string;
	  }
	| undefined
> = writable();
