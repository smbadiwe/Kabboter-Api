import { BaseEntityService } from "./baseentity.service";

export default class VoteService extends BaseEntityService {
  constructor() {
    super("votes");
  }

  async hasMemberVoted(member_id, election_id) {
    const memberVote = await this.connector
      .table(this.tableName)
      .where({ memberId: member_id, electionId: election_id })
      .first();

    if (memberVote) return true;

    return false;
  }
}
