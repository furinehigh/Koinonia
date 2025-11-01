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
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github') {
        const ghostUserId = account?.uId ?? '';
        console.log('ghostUserId', ghostUserId, user, profile)

        if (ghostUserId) {
          const existingAccount = await prisma.account.findFirst({
            where: { provider: 'github', providerAccountId: account.providerAccountId }
          });

          if (!existingAccount) {
            await prisma.account.create({
              data: {
                userId: ghostUserId,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                token_type: account.token_type,
                scope: account.scope,
              }
            });

            await prisma.user.update({
              where: { id: ghostUserId },
              data: {
                name: profile?.name || profile?.login || undefined,
                email: profile?.email || undefined,
                username: profile?.login || undefined,
                image: profile?.avatar_url || undefined,
              }
            });

            console.log(`Linked GitHub to existing user ${ghostUserId}`);
          }
        }
      }

      return true;
    },
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
