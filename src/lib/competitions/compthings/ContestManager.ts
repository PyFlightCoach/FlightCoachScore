import type {
	CompThingCreateUpdate,
	CompThingSummary,
	CreateFakeUserRequest
} from '../../api/DBInterfaces/competition';
import { dbServer } from '$lib/api';
import { get } from 'svelte/store';
import { user } from '$lib/stores/user';
import { PilotManager } from '$lib/competitions/competitors/PilotManager';
import { library } from '$lib/schedule/library';
import { includesUUID } from '$lib/utils/text';

export class ContestManager {
	children: ContestManager[] = [];
	isMyComp: boolean;
	iAmCompeting: boolean;
	iCanEnter: boolean;
	iCanUpload: boolean;
	competitors: PilotManager[];
	whatAreMyChildren: 'Stage' | 'Round' | undefined;
	normalise: boolean = false;
	cutLoc: number;

	constructor(
		readonly summary: CompThingSummary,
		readonly parent: ContestManager | undefined = undefined,
		i_am_cd: boolean | undefined = undefined,
		i_am_competitor: boolean | undefined = undefined,
		i_can_upload_to: boolean | undefined = undefined
	) {
		this.children = (summary.children || []).map((c) => new ContestManager(c, this));

		this.competitors =
			this.summary.competitors?.map((c) => new PilotManager(this.summary.id, c)) || [];

		if (i_am_competitor === undefined) {
			this.iAmCompeting = includesUUID(summary.competitors?.map((d) => d.id) || [], get(user)?.id);
		} else {
			this.iAmCompeting = i_am_competitor!;
		}

		if (i_can_upload_to === undefined) {
			this.iCanUpload =
				(this.iAmCompeting &&
					this.summary.is_open_now &&
					this.summary.add_rules?.cd_and_self_add) ||
				false;
		} else {
			this.iCanUpload = (i_can_upload_to && this.summary.add_rules?.cd_and_self_add) || false;
		}

		this.iCanEnter = this.summary.add_rules?.cd_and_self_add || false;
		this.whatAreMyChildren =
			this.summary.what_am_i === 'Competition'
				? 'Stage'
				: this.summary.what_am_i === 'Stage'
					? 'Round'
					: undefined;

		if (i_am_cd === undefined) {
			this.isMyComp =
				includesUUID(this.competition.summary.directors?.map((d) => d.id) || [], get(user)?.id) ||
				get(user)!.is_superuser;
		} else {
			this.isMyComp = i_am_cd!;
		}

		this.normalise =
			this.summary.result_rules?.normalise_best_to_n ||
			this.summary.result_rules?.normalise_average_to_n
				? true
				: false;

		const nProgress = this.summary.result_rules?.progress_top_n;
		this.cutLoc = this.competitors.filter(
			(c) => nProgress && c.competitor.position && c.competitor.position <= nProgress
		).length;
	}

	sortCompetitors(by: 'Running Order' | 'Results') {
		return this.competitors.sort((a, b) => {
			if (by === 'Running Order') {
				return (a.competitor.flight_order || 0) - (b.competitor.flight_order || 0);
			} else {
				return (a.competitor.position || 0) - (b.competitor.position || 0);
			}
		});
	}

	static async load(
		id: string,
		i_am_cd: boolean | undefined = undefined,
		i_am_competitor: boolean | undefined = undefined,
		i_can_upload_to: boolean | undefined = undefined
	) {
		return await dbServer.get(`/competition/${id}`).then((res) => {
			return new ContestManager(
				res.data as CompThingSummary,
				undefined,
				i_am_cd,
				i_am_competitor,
				i_can_upload_to
			);
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
			if (this.parent) {
				return dbServer
					.get(`competition/${this.parent.summary.id}`)
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

	async createPilot(id_or_info: string | CreateFakeUserRequest): Promise<string> {
		if (typeof id_or_info === 'string') {
			return id_or_info;
		} else {
			return dbServer
				.post('competition/create_fake_user', id_or_info)
				.then((res) => res.data.id as string);
		}
	}

	async addPilot(
		id_or_email: string,
		flight_order: number | undefined = undefined,
		registration: string | undefined = undefined
	) {
		return dbServer
			.post(`competition/competitor`, {
				comp_id: this.summary.id,
				user_id: id_or_email,
				flight_order,
				client_meta: registration ? { registration } : {}
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

	get rounds() {
		if (this.whatAreMyChildren === 'Round') {
			return this.children;
		} else if (this.whatAreMyChildren === 'Stage') {
			return this.children.map((s) => s.children).flat();
		} else {
			throw new Error('Cannot get rounds for a round');
		}
	}

	openRounds(schedule_id: string | undefined) {
		const openRounds = this.rounds.filter((r) => {
			if (!r.summary.is_open_now) return false;
			if (schedule_id && r.summary.schedule_id && r.summary.schedule_id !== schedule_id)
				return false;
			return true;
		});

		return openRounds;
	}

	checkSchedule(schedule_id: string | undefined, open: boolean = true) {
		//Check if this competition has the given schedule_id in one of its rounds
		return this.rounds.some(
			(r) => r.summary.schedule_id == schedule_id && (!open || r.summary.is_open_now)
		);
	}

	checkCanUpload(schedule_id: string | undefined) {
		console.log('Checking can upload for schedule:', schedule_id, ' in comp:', this.summary.id);
		return (
			this.checkSchedule(schedule_id, true) &&
			(this.iAmCompeting || this.isMyComp) &&
			this.competitors.length > 0
		);
	}

	schedules() {
		return get(library).downselect(
			this.rounds.filter((r) => !!r.summary.schedule_id).map((r) => r.summary.schedule_id!)
		);
	}

	async rotateFlightOrder(
		cont_from_previous: boolean,
		randomise_first_round: boolean,
		rotate_by: number
	) {
		return dbServer
			.post(`competition/stage/rotatefo`, {
				stage_id: this.summary.id,
				cont_from_previous,
				randomise_first_round: !cont_from_previous && randomise_first_round,
				rotate_by
			})
			.then((res) => new ContestManager(res.data as CompThingSummary));
	}

	async addDirector(user_id: string) {
		return dbServer
			.post(`competition/director`, {
				comp_id: this.summary.id,
				user_id
			})
			.then((res) => new ContestManager(res.data as CompThingSummary));
	}

	async removeDirector(user_id: string) {
		return dbServer
			.delete(`competition/director/${this.summary.id}/${user_id}`)
			.then((res) => new ContestManager(res.data as CompThingSummary));
	}

	get competition() {
		let comp: ContestManager = this.parent || this;
		while (comp.parent) {
			comp = comp.parent;
		}
		return comp;
	}
}
