export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Editor" | "Reviewer" | "Viewer";
  status: "active" | "invited" | "suspended";
  lastActive: string;
}
