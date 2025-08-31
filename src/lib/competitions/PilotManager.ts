import type { Competitor } from '$lib/competitions/compInterfaces';
import { dbServer } from '$lib/api';
import { ContestManager } from './ContestManager';


export class PilotManager {
	constructor(private parentID: string, private competitor: Competitor) {}

	async delete() {
		dbServer
			.delete(`competition/competitor/${this.parentID}/${this.competitor.id}`)
			.then(() => {
        return ContestManager.load(this.parentID)
			});
	}


}
