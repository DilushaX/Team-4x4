import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

class DatabaseUnavailableError extends CredentialsSignin {
  code = "database_unavailable";
}

class InvalidCredentialsError extends CredentialsSignin {
  code = "invalid_credentials";
}

function isDatabaseUnavailable(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientInitializationError ||
    (error instanceof Prisma.PrismaClientKnownRequestError &&
      ["P1001", "P1017", "P2024"].includes(error.code))
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new InvalidCredentialsError();
        }

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        let user;
        try {
          user = await prisma.user.findUnique({ where: { email } });
        } catch (error) {
          if (isDatabaseUnavailable(error)) {
            throw new DatabaseUnavailableError();
          }
          throw error;
        }

        if (!user) throw new InvalidCredentialsError();

        const hash = user.password.replace(/^\$2y\$/, "$2a$");
        const valid = await bcrypt.compare(password, hash);
        if (!valid) throw new InvalidCredentialsError();

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "customer";
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "customer";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 60,
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
});
