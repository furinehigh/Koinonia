import GithubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"


export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email || `${profile.id}@github.local`, // fallback if email is null
          image: profile.avatar_url,
          username: profile.login,

        }
      },
    }),
    CredentialsProvider({
      name: 'Specter Login',
      credentials: {},
      async authorize(_, req) {
        const specterId = `specter_${Math.random().toString(36).slice(2, 10)}`
        const username = `Specter_${specterId.slice(-4)}`

        let user = await prisma.user.findUnique({ where: { id: specterId } })
        if (!user) {
          user = await prisma.user.create({
            data: {
              id: specterId,
              name: username,
              email: `${specterId}@specter.node`,
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
