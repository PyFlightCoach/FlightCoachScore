import type { Competitor } from '$lib/competitions/compInterfaces';
import { dbServer } from '$lib/api';
import { ContestManager } from '$lib/competitions/compthings/ContestManager';
import type { DBUser } from '$lib/stores/user';

export class PilotManager {
	user: DBUser | undefined = undefined;
	constructor(
		readonly parentID: string,
		readonly competitor: Competitor
	) {}

	async delete() {
		return dbServer
			.delete(`competition/competitor/${this.parentID}/${this.competitor.id}`)
			.then(() => {
				return ContestManager.load(this.parentID);
			});
	}

	async getUser() {
		if (!this.user) {
			this.user = await dbServer
				.get(`users/${this.competitor.id}`)
				.then((res) => res.data as DBUser);
		}
		return this.user as DBUser;
	}
}
