// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import Github from "next-auth/providers/github";

export const authOptions = {
  providers: [
    Github({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // modify token if user exists (first login)
      if (user) {
        token.id = user.id;
        // ... other fields
      }
      return token;
    },
    async session({ session, token }) {
      // Add extra fields to session.user from token
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
