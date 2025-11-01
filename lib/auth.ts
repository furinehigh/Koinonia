import GithubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import { AuthOptions } from "next-auth"


export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email"
        }
      },
      async profile(profile, tokens) {
        const ghostUserId = tokens?.ghostId as string | undefined;
        console.log('ghostId', tokens)

        const githubAlreadyLinked = await prisma.user.findUnique({
          where: {
            username: profile.login
          }
        })

        if (githubAlreadyLinked) return null;

        if (ghostUserId) {
          const existingUser = await prisma.user.findUnique({ where: { id: ghostUserId } });

          if (existingUser) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                email: profile.email ?? existingUser.email,
                name: profile.name ?? existingUser.name,
                username: profile.login,
                image: profile.avatar_url,
              },
            });
            return { id: existingUser.id };
          }
        }

        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email || `${profile.id}@github.local`,
          image: profile.avatar_url,
          username: profile.login,
        };
      },
    }),
    CredentialsProvider({
      name: 'Ghost Login',
      credentials: {},
      async authorize(_, req) {
        const specterId = `ghost_${Math.random().toString(36).slice(2, 10)}`
        const username = `Ghost_${specterId.slice(-4)}`

        let user = await prisma.user.findUnique({ where: { id: specterId } })
        if (!user) {
          user = await prisma.user.create({
            data: {
              id: specterId,
              name: username,
              email: `${specterId}@ghost.node`,
              username,
              image: '/logo.png'
            }
          })
          await prisma.mana.create({
            data: { userId: user.id, mana: 50 },
          })
        }

        return user
      }
    })
  ],
  session: { strategy: "jwt" },

  callbacks: {
  async jwt({ token, user, account }) {
    // When GitHub sends back the OAuth response
    if (account?.provider === "github" && account?.access_token) {
      const parsedState = account?.state ? JSON.parse(account.state) : null;
      if (parsedState?.ghostId) {
        token.ghostId = parsedState.ghostId;
      }
    }

    if (user) {
      token.id = user.id;
      token.username = user.username;
    }

    return token;
  },

  async session({ session, token }) {
    session.user.id = token.id;
    session.user.username = token.username;
    session.user.ghostId = token.ghostId; // Optional: expose to frontend
    return session;
  },
},


  events: {
    async createUser({ user }) {
      try {
        const existing = await prisma.mana.findUnique({
          where: { userId: user.id },
        })

        if (!existing) {
          await prisma.mana.create({
            data: {
              userId: user.id,
              mana: 50,
            },
          })

          console.log(`Created default mana and users spells record for ${user.email}`)
        }
      } catch (err) {
        console.error("Error creating mana record:", err)
      }
    },
  },
}
