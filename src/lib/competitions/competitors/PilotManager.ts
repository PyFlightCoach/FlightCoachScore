import type { Competitor } from '$lib/competitions/compInterfaces';
import { dbServer } from '$lib/api';
import { ContestManager } from '$lib/competitions/compthings/ContestManager';
import type { DBUser } from '$lib/stores/user';

export class PilotManager {
	constructor(readonly parentID: string, readonly competitor: Competitor) {}

	async delete() {
		return dbServer
			.delete(`competition/competitor/${this.parentID}/${this.competitor.id}`)
			.then(() => {
        return ContestManager.load(this.parentID)
			});
	}

  async user() {
    return dbServer.get(`users/${this.competitor.id}`).then(res=>res.data as DBUser);
  }

}
