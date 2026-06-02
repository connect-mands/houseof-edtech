import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { loginSchema } from "@/lib/validations/lesson";
import { isDbConnectionError } from "@/lib/db/safe-query";
import { logDbError } from "@/lib/db/connection";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        try {
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, parsed.data.email.toLowerCase()))
            .limit(1);

          if (!user) return null;

          const valid = await bcrypt.compare(
            parsed.data.password,
            user.passwordHash,
          );
          if (!valid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          if (isDbConnectionError(error)) {
            logDbError(error, "authorize:credentials");
            return null;
          }
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
