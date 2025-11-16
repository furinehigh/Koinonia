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
              image: '/ghost.png'
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
    async signIn({ user, account, profile }) {
      // Only handle GitHub provider
      if (account?.provider === 'github') {
        const githubId = account.providerAccountId

        // Someone else already linked this GitHub?
        const existingGithub = await prisma.account.findFirst({
          where: {
            provider: 'github',
            providerAccountId: githubId
          }
        })

        const isLinking = !!user && !existingGithub

        // --- CASE 1: GitHub already connected to another user ---
        if (existingGithub && existingGithub.userId !== user.id) {
          console.log('GitHub already linked to another user.')
          return false
        }

        // --- CASE 2: user is logged in as ghost and linking github ---
        if (!existingGithub && user) {
          await prisma.account.create({
            data: {
              userId: user.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              token_type: account.token_type,
              scope: account.scope,
            }
          })

          await prisma.user.update({
            where: { id: user.id },
            data: {
              name: profile?.name || profile?.login,
              email: profile?.email || `${profile?.id}@github.local`,
              image: profile?.avatar_url,
              username: profile?.login,
            }
          })
        }
      }

      return true
    }
    ,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
      }
      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.username = token.username
      }
      return session
    }

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
