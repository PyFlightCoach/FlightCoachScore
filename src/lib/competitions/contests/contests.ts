import { ContestManager } from '../compthings/ContestManager';
import type { CompListRequest, CompThingSummary } from '../compInterfaces';
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
		.then((res) => {
			return res.data.results.map((res: CompThingSummary) => new ContestManager(res));
		})
		.then((comps: ContestManager[]) =>
			comps.filter((c) => {
				if (category_id && c.summary.category_id != category_id) {
					return false;
				}
				if (group == 'Open' && (!c.summary.add_rules?.cd_and_self_add || c.iAmCompeting)) {
					return false;
				}
        return true;
			})
		);
}


export const contestActions = [
  "View",
  "Enter",
  "Select",
  "Manage"
]

export type ContestAction = typeof contestActions[number];
