import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { authConfig } from "@/auth.config";
import { getActiveCustomers } from "./mock-data";

class InvalidCredentialsError extends CredentialsSignin {
  code = "invalid_credentials";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
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

        // 1. Check hardcoded demo admin
        if (email === "admin@team4x4.lk" && password === "admin") {
          return {
            id: "1",
            name: "Admin",
            email: "admin@team4x4.lk",
            role: "admin",
          };
        }

        // 2. Check hardcoded demo customer
        if (email === "kasun@email.lk" && (password === "customer" || password === "password123")) {
          return {
            id: "2",
            name: "Kasun Silva",
            email: "kasun@email.lk",
            role: "customer",
          };
        }

        // 3. Check database via Prisma
        try {
          const user = await prisma.user.findUnique({ where: { email } });
          if (user) {
            const hash = user.password.replace(/^\$2y\$/, "$2a$");
            const valid = await bcrypt.compare(password, hash);
            if (valid) {
              return {
                id: String(user.id),
                name: user.name,
                email: user.email,
                role: user.role,
              };
            }
          }
        } catch {
          /* DB unavailable — proceed to mock check */
        }

        // 4. Check persistent mock customers
        const mockCustomer = getActiveCustomers().find(
          (c) => c.email.toLowerCase() === email
        );
        if (mockCustomer) {
          if (mockCustomer.password) {
            const valid = await bcrypt.compare(password, mockCustomer.password);
            if (valid) {
              return {
                id: String(mockCustomer.id),
                name: mockCustomer.name,
                email: mockCustomer.email,
                role: mockCustomer.role || "customer",
              };
            }
          } else {
            // Direct match fallback
            return {
              id: String(mockCustomer.id),
              name: mockCustomer.name,
              email: mockCustomer.email,
              role: mockCustomer.role || "customer",
            };
          }
        }

        throw new InvalidCredentialsError();
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 60,
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
});
