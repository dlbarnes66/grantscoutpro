export const Roles = {
  ADMIN: "admin",
  EDITOR: "editor",
  VIEWER: "viewer",
};

export function isRole(role: string) {
  return Object.values(Roles).includes(role);
}
