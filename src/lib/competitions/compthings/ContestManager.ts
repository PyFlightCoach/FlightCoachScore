import type { CompThingCreateUpdate, CompThingSummary } from '../compInterfaces';
import { dbServer } from '$lib/api';
import { get } from 'svelte/store';
import { user } from '$lib/stores/user';
import { PilotManager } from '$lib/competitions/competitors/PilotManager';

export class ContestManager {
	children: ContestManager[] = [];
	isMyComp: boolean;
	iAmCompeting: boolean;
	iCanEnter: boolean;
	competitors: PilotManager[];
	whatAreMyChildren: 'Stage' | 'Round' | undefined;

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

		this.competitors =
			this.summary.competitors?.map((c) => new PilotManager(this.summary.id, c)) || [];
		this.iAmCompeting = this.summary.competitors?.some((c) => c.competitor_id == userID) || false;
		this.iCanEnter = this.summary.add_rules?.cd_and_self_add || false;
		this.whatAreMyChildren =
			this.summary.what_am_i === 'Competition'
				? 'Stage'
				: this.summary.what_am_i === 'Stage'
					? 'Round'
					: undefined;
	}

	static async load(id: string) {
		return await dbServer.get(`/competition/${id}`).then((res) => {
			return new ContestManager(res.data as CompThingSummary);
		});
	}

	static async newCompetition(data: CompThingCreateUpdate): Promise<ContestManager> {
		return await dbServer.post('/competition', data).then((res) => {
			return new ContestManager(res.data as CompThingSummary);
		});
	}

	async addChild(data: CompThingCreateUpdate) {
		return await dbServer
			.post('/competition', { ...data, parent_id: this.summary.id })
			.then((res) => {
				return new ContestManager(res.data as CompThingSummary);
			});
	}

	async delete() {
		return dbServer.delete(`competition/${this.summary.id}`).then(() => {
			if (this.summary.what_am_i != 'Competition') {
				return dbServer
					.get(`competition/${this.parentID}`)
					.then((res) => new ContestManager(res.data as CompThingSummary));
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

	async addFlight(flight_id: string) {
		return dbServer
			.post(`competition/round/add_flight`, {
				round_id: this.summary.id,
				flight_id
			})
			.then((res) => new ContestManager(res.data as CompThingSummary));
	}
}
