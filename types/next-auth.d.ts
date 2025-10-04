// types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      // any other custom property
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    // add your fields here, e.g.:
    id: string;
    // role?: "user" | "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    // other custom token fields
  }
}
