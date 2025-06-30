import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { UserType, User, SessionUser } from "@/types";

// Custom utility type for our session
interface CustomSession {
  user?: SessionUser;
  expires: string;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any, // This cast is needed because of PrismaAdapter typing issues
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "email@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            // Include additional fields for specific user types
            ...(credentials.userType === "provider" && {
              provider: true,
            }),
          },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          userType: user.userType as UserType,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }): Promise<CustomSession> {
      if (token) {
        return {
          ...session,
          user: {
            id: Number(token.id),
            name: token.name as string | null,
            email: token.email as string,
            userType: token.userType as UserType,
          },
        };
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          name: user.name,
          email: user.email,
          userType: user.userType,
        };
      }
      return token;
    },
  },
}; 