import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    orgId?: string;
    role?: string;
    superAdmin?: boolean;
    name?: string;
    email?: string;
    image?: string;
  }

  interface Session {
    user: {
      id: string;
      orgId?: string;
      role?: string;
      superAdmin?: boolean;
      name?: string;
      email?: string;
      image?: string;
    };
  }

  interface JWT {
    id: string;
    orgId?: string;
    role?: string;
    superAdmin?: boolean;
  }
}
