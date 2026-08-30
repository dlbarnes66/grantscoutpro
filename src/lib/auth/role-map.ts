// src/lib/auth/role-map.ts
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  owner: ["workspace:manage", "workspace:billing", "workspace:write", "workspace:read"],
  admin: ["workspace:write", "workspace:read"],
  member: ["workspace:read"],
  viewer: ["workspace:read"],
};
