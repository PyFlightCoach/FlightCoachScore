import type { Competitor } from '$lib/api/DBInterfaces/competition';
import { dbServer } from '$lib/api';
import { ContestManager } from '$lib/competitions/compthings/ContestManager';
import type { DBUser } from '$lib/stores/user';
import type { CompThingSummary } from '$lib/api/DBInterfaces/competition';
import { compareUUIDs } from '$lib/utils/text';

export class PilotManager {
	user: DBUser | undefined = undefined;
	constructor(
		readonly parentID: string,
		readonly competitor: Competitor
	) {}

	async delete() {
		return dbServer
			.delete(`competition/competitor/${this.parentID}/${this.competitor.id}`)
			.then((res) => {
				return new ContestManager(res.data as CompThingSummary);
			});
	}

  async deleteScore() {
    return dbServer
      .delete(`competition/round/remove_flight/${this.parentID}/${this.competitor.competitor_id}`)
      .then((res) => {
				return new ContestManager(res.data as CompThingSummary);
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

  isMe(userid: string) {
    return compareUUIDs(this.competitor.id, userid);
  }

  get display() {

    if (this.competitor.raw_score) {
      return this.competitor.raw_score.toFixed(2);
    }


  }


}
