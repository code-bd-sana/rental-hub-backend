export interface ICreateTeamPayload {
  name: string;
  description?: string;
}

export interface IUpdateTeamPayload {
  name?: string;
  description?: string;
}

export interface IAddMemberPayload {
  userId: string;
}
