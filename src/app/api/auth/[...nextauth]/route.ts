import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const auth = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) return null;

        const valid = credentials.password === user.password;
        if (!valid) return null;

        return {
          id: user.id,
          orgId: user.orgId ?? null,
          role: user.role ?? null,
          superAdmin: user.superAdmin ?? null,
          name: user.name ?? null,
          email: user.email ?? null,
          image: user.image ?? null
        };
      }
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.orgId = user.orgId;
        token.role = user.role;
        token.superAdmin = user.superAdmin;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.orgId = token.orgId;
      session.user.role = token.role;
      session.user.superAdmin = token.superAdmin;
      return session;
    }
  },

  session: {
    strategy: "jwt"
  }
});

export { auth as GET, auth as POST };
