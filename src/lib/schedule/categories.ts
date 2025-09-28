import { dbServer } from '$lib/api';
import {writable, type Writable} from 'svelte/store';
import { get } from 'svelte/store';

export interface CategoryResponse {
  category_id: string;
  category_name: string;
  rule_id: string;
  rule_name: string;
}


const categories: Writable<CategoryResponse[]> = writable([]);

export async function getCategories(): Promise<CategoryResponse[]> {
  if (get(categories).length === 0) {
    await dbServer.get('/schedule/categories')
    .then(res => {
      categories.set(res.data.results as CategoryResponse[])
    });
  } 
  return get(categories);
}