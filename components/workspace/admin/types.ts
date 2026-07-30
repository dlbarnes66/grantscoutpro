export interface WorkspaceMember {
  userId: string;
  role: "MEMBER" | "ADMIN" | "OWNER";
  user: {
    email: string;
    name?: string;
  };
}
