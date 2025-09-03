import type { Competitor } from '$lib/competitions/compInterfaces';
import { dbServer } from '$lib/api';
import { ContestManager } from '$lib/competitions/compthings/ContestManager';


export class PilotManager {
	constructor(readonly parentID: string, readonly competitor: Competitor) {}

	async delete() {
		return dbServer
			.delete(`competition/competitor/${this.parentID}/${this.competitor.id}`)
			.then(() => {
        return ContestManager.load(this.parentID)
			});
	}


}
