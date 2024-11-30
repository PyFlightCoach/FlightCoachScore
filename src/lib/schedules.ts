import { dbServer } from '$lib/api';

export interface Manoeuvre {
	id: string;
	index: number;
	k: number;
	name: string;
	short_name: string;
	version: string;
}

export interface Schedule {
	schedule_id: string;
	schedule_name: string;
	owner_id: string;
	owner_name: string;
	category_id: string;
	category_name: string;
	rule_id: string;
	rule_name: string;
	manoeuvres: Manoeuvre[];
	num_flights: number;
}

export interface Category {
	category_id: string;
	category_name: string;
	rule_id: string;
	rule_name: string;
	schedules?: Record<string, Schedule>;
}

export async function loadSchedules(
	request: Record<string, unknown>
): Promise<Record<string, Schedule>> {
	const schedules = await dbServer.get(`schedule/schedules`, request);
	return Object.fromEntries(schedules.results.map((s: Schedule) => [s.schedule_name, s]));
}

export async function loadCategories(user: string='me'): Promise<Record<string, Category>> {
	const cats = await dbServer.get(`schedule/categories`);

  const ocats: Record<string, Category> = {};
  cats.results.forEach((cat: Category) => {
    loadSchedules({ category: cat.category_name, owner: user}).then((schedules) => {

      ocats[cat.category_name] = Object.assign(cat, {schedules});
    });
  });

  return ocats;
}

export const library = await loadCategories('thomasdavid0@googlemail.com');
