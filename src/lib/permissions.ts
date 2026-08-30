export function canUser(action: string, role: string) {
  if (role === "admin") return true;
  if (role === "editor" && action !== "delete") return true;
  return false;
}
