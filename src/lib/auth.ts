import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { compare } from "bcryptjs";

// Define custom user type
interface CustomUser {
  id: string;
  email: string;
  name: string;
  userType: string;
  username?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        userType: { label: "User Type", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        // Check if it's an admin email
        if (credentials.email === "admin@gmail.com") {
          const admin = await prisma.admin.findUnique({
            where: { email: credentials.email }
          });

          if (!admin) {
            throw new Error("Admin account not found");
          }

          const isPasswordValid = await compare(credentials.password, admin.password);
          if (!isPasswordValid) {
            throw new Error("Invalid email or password");
          }

          return {
            id: admin.id.toString(),
            email: admin.email,
            name: admin.name || admin.username,
            userType: "admin",
            username: admin.username,
          } as CustomUser;
        }

        // For non-admin users, require userType
        if (!credentials.userType) {
          throw new Error("Please select a user type");
        }

        // Check both User and ServiceProvider tables for non-admin users
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        const provider = await prisma.serviceProvider.findUnique({
          where: { email: credentials.email }
        });

        const account: any = user || provider;
        if (!account) {
          throw new Error("Invalid email or password");
        }

        const isPasswordValid = await compare(credentials.password, account.password);
        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        // Determine userType
        const userType = provider ? "serviceProvider" : "user";

        return {
          id: account.id.toString(),
          email: account.email,
          name: 'name' in account ? account.name || account.username : account.username,
          userType,
          username: account.username,
        } as CustomUser;
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.userType = (user as CustomUser).userType;
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        if (session.user) {
          (session.user as any).id = token.id as string;
          (session.user as any).email = token.email as string;
          (session.user as any).name = token.name as string;
          (session.user as any).userType = token.userType;
          (session.user as any).username = token.username;
        }
      }
      return session;
    }
  },
  debug: process.env.NODE_ENV === "development"
}; 