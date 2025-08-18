import { writable, type Writable } from 'svelte/store';
import type { DBUser } from '../stores/user';
import { type AddRule, type CompThingCreateUpdate, type CompThingSummary } from './compInterfaces';
import {faVersion} from '$lib/stores/shared';
import {get} from 'svelte/store';
import { dbServer } from '$lib/api';

export const myComps: Writable<string[]> = writable([]);

export const activeComp: Writable<CompThingSummary | undefined> = writable();

export async function createComp(name: string, cd: DBUser, addRule: AddRule) {
  const newComp: CompThingCreateUpdate = {
    name,
    fa_version: get(faVersion) as string,
//    directors: [cd.email],
    add_rules:addRule
  };

  return await dbServer.post('/competition', newComp).then((res) => {
    myComps.update((comps) => [...comps, res.data.id]);
    return res.data as CompThingSummary
  });
}