import { ContestManager } from '../compthings/ContestManager';
import type { CompListRequest, CompThingSummary, CompListResponse } from '../../api/DBInterfaces/competition';
import { dbServer } from '$lib/api';


export const contestGroups = {
  All: 'All competitions',
  Mine: 'Competitions You are organizing',
  Open: 'Competitions you can enter',
  Entered: 'Competitions you have entered',
  Ready: 'Competitions waiting for you to upload a flight'
};

export type ContestGroup = keyof typeof contestGroups;

export async function listComps(
	group: ContestGroup = 'All',
	category_id: string | undefined = undefined
) {
	const params: CompListRequest = {
		n_days: undefined,
		date_after: undefined,
		date_before: undefined,
    include_competitors: true,
		i_am_cd: group == 'Mine' ? true : undefined,
		i_am_competitor: group == 'Entered' ? true : undefined,
		i_can_upload_to: group == 'Ready' ? true : undefined
	};

	return dbServer
		.get('/competition/list/', {params})
		.then((comps) =>
			comps.data?.results.filter((c: CompListResponse) => {
				if (category_id && c.compthing.category_id != category_id) {
					return false;
				}
				if (group == 'Open' && (!c.compthing.add_rules?.cd_and_self_add || c.i_am_competitor)) {
					return false;
				}
        return true;
			}).map((c: CompListResponse) => new ContestManager(c.compthing, undefined, c.i_am_cd, c.i_am_competitor, c.i_can_upload_to))
		);
}


export const contestActions = [
  "View",
  "Enter",
  "Select",
  "Manage"
]

export type ContestAction = typeof contestActions[number];
