import { writable, type Writable } from 'svelte/store';
import type { Pathname } from '$app/types';
import { page } from '$app/state';
import { goto } from '$app/navigation';

export type NavBarPage = {
	href?: Pathname | undefined;
	onclick?: () => void;
	icon: string;
	name: string;
	title: string;
	disabled?: boolean;
};

export class NavBarContents {
	constructor(
		readonly items: NavBarPage[] = [],
		readonly active: Set<string> = new Set()
	) {}

	checkUrl() {
		return new NavBarContents(
			this.items,
			new Set(
				this.items
					.filter((p) => {
						const nblink = p.href?.split('?')[0].replaceAll('/', ' ').trim();
						const ppath = page.url.pathname.replaceAll('/', ' ').trim();
						return nblink === ppath;
					})
					.map((p) => p.name)
			)
		);
	}

	activate(i: number, unsetOthers = true) {
		return new NavBarContents(
			this.items,
			new Set([this.items[i].name, ...(unsetOthers ? [] : Array.from(this.active))])
		);
	}

	click(i: number) {
		if (this.items[i].onclick) {
			this.items[i].onclick();
		}
		if (this.items[i].href) {
			goto(this.items[i].href);
		}
    return this.activate(i);
	}

  get first() {
    return Array.from(this.active)[0];
  }

}

export const navBarContents: Writable<NavBarContents> = writable(new NavBarContents());


export function reset(items: NavBarPage[] = [], active: Set<string> = new Set([])) {
  navBarContents.set(new NavBarContents(items, active));
}

export function click(i: number) {
  navBarContents.update((nbc=>nbc.click(i)))
}

export function checkUrl() {
  navBarContents.update((nbc=>nbc.checkUrl()))
}

export const showCollapseToggle: Writable<boolean> = writable(false);