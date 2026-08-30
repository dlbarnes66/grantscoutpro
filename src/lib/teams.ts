export function getTeamSize(team: any[]) {
  return team.length;
}

export function addTeamMember(team: any[], member: any) {
  return [...team, member];
}
