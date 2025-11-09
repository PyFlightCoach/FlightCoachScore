import { writable, type Writable } from 'svelte/store';
import type { Pathname } from '$app/types';
import { page } from '$app/state';
import { goto } from '$app/navigation';
import {get} from 'svelte/store';
import { resolve } from '$app/paths';

export type NavBarPage = {
	href?: Pathname | undefined;
	onclick?: () => void;
	icon: string;
	name: string;
	title: string;
	disabled?: boolean;
  active?: boolean;
};





export class NavBarContents {
	constructor(
		readonly items: NavBarPage[] = [],
	) {
    this.items.forEach(item => {
      console.log(`Checking nav item ${item.href} against ${page.url.pathname}`);
      if (page.url.pathname == item.href) {
        console.log(`Activating nav item ${item.href}`);
        item.active = true;
      }
    });
  }

	activate(i: number, unsetOthers = true) {
		return new NavBarContents(
			this.items.map((item, idx) => ({
        ...item,
        active: unsetOthers ? idx === i : item.active || idx === i,
      })),
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

  get active() {
    return this.items.find(item=>item.active)?.name;
  }

}



export const navBarContents: Writable<NavBarContents> = writable(new NavBarContents());


export function reset(items: NavBarPage[] = []) {
  console.log("setting navbar contents");
  navBarContents.set(new NavBarContents(items));

  console.log(get(navBarContents).active);

  return ()=>{
    console.log("clearing navbar contents");
    navBarContents.set(new NavBarContents([]))};
}

export function click(i: number) {
  navBarContents.update((nbc=>nbc.click(i)))
}

export const showCollapseToggle: Writable<boolean> = writable(false);