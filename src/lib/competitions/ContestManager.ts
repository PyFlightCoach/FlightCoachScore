import type { CompThingCreateUpdate, CompThingSummary } from './compInterfaces';
import { dbServer } from '$lib/api';
import { faVersion } from '$lib/stores/shared';
import { get } from 'svelte/store';
import { user } from '$lib/stores/user';
import { goto } from '$app/navigation';
import {base} from "$app/paths";
import { PilotManager } from './PilotManager';

export class ContestManager {
	children: ContestManager[] = [];
	isMyComp: boolean;
  competitors: PilotManager[];

	constructor(
		readonly summary: CompThingSummary,
		readonly parentID: string | undefined = undefined
	) {
		this.children = (summary.children || []).map((c) => new ContestManager(c, this.summary.id));

		const userID = get(user)?.id.replaceAll('-', '');
		this.isMyComp =
			this.summary.directors?.map((d) => d.id.replaceAll('-', '')).includes(userID || '') ||
			get(user)?.is_superuser ||
			false;

    this.competitors = this.summary.competitors?.map(c => new PilotManager(this.summary.id, c)) || [];
	}

  static async load(id: string) {
		return await dbServer
			.get(`/competition/${id}`)
			.then((res) => {
				return new ContestManager(res.data as CompThingSummary);
			});
	}

	static async createEmptyCompetition(name: string): Promise<ContestManager> {
		return await dbServer
			.post('/competition', {
				name,
				fa_version: get(faVersion) as string
			} as CompThingCreateUpdate)
			.then((res) => {
				return new ContestManager(res.data as CompThingSummary);
			});
	}

	async addChild(name: string) {
		return await dbServer
			.post('/competition', {
				name,
				parent_id: this.summary.id
			} as CompThingCreateUpdate)
			.then((res) => {
				return new ContestManager(res.data as CompThingSummary);
			});
	}

	async delete() {
		return dbServer.delete(`competition/${this.summary.id}`).then(() => {
			if (this.summary.what_am_i != 'Competition') {
				return dbServer.get(`competition/${this.parentID}`).then((res) => new ContestManager(res.data as CompThingSummary));
			} else {
        goto(base);
      }
		});
	}

	async toggle_open() {
		return dbServer
			.post(`competition/round/${this.summary.is_open_now ? 'stop' : 'start'}/${this.summary.id}`)
			.then((res) => {
				return new ContestManager(res.data as CompThingSummary);
			});
	}

	async update(updateRequest: CompThingCreateUpdate) {
		return dbServer
			.patch(`competition/${this.summary.id}`, updateRequest)
			.then((res) => new ContestManager(res.data as CompThingSummary));
	}

	async addPilot(
		id_or_email: string,
		name_override: string | undefined = undefined,
		flight_order: number | undefined = undefined,
		registration: string | undefined = undefined
	) {
		return dbServer
			.post(`competition/competitor/`, {
				comp_id: this.summary.id,
				user_id: id_or_email,
				name_override,
				flight_order,
				registration
			})
			.then((res) => new ContestManager(res.data as CompThingSummary));
	}
}
