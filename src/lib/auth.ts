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
  adapter: PrismaAdapter(prisma) as any,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: false,
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
        userType: { label: "User Type", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        let user = null;
        let userType = credentials.userType as string;

        // For admin login
        if (credentials.email === "admin@gmail.com") {
          const admin = await prisma.admin.findUnique({
            where: { email: credentials.email },
          });

          if (!admin) {
            throw new Error("Admin account not found");
          }

          const isPasswordValid = await compare(credentials.password, admin.password);
          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          return {
            id: admin.id.toString(),
            name: admin.name,
            email: admin.email,
            userType: "admin" as UserType,
          };
        }

        // For regular users, userType is required
        if (!userType || !["user", "serviceProvider"].includes(userType)) {
          throw new Error("Please select your account type");
        }

        // Check the appropriate table based on user type
        if (userType === "user") {
          user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          
          if (!user) {
            throw new Error("No customer account found with this email");
          }
        } else if (userType === "serviceProvider") {
          user = await prisma.serviceProvider.findUnique({
            where: { email: credentials.email },
          });
          
          if (!user) {
            throw new Error("No provider account found with this email");
          }
        }

        if (!user) {
          throw new Error("Account not found");
        }

        const isPasswordValid = await compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error("Incorrect password");
        }

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          userType: userType as UserType,
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