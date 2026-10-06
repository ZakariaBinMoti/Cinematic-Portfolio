import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

const adminEmail = (process.env.ADMIN_EMAIL || "zakaria.binmoti@gmail.com").toLowerCase().trim();

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Admin Login",
    credentials: {
      email: { label: "Email", type: "email", placeholder: "admin@example.com" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Missing credentials");
      }

      await dbConnect();

      // Check if DB is empty, if so, seed the admin
      const adminUsersCount = await User.countDocuments({ email: adminEmail });

      if (adminUsersCount === 0) {
        const initialPasswordHash = await bcrypt.hash("789878", 10);
        await User.create({ email: adminEmail, passwordHash: initialPasswordHash });
      }

      const user = await User.findOne({ email: credentials.email.toLowerCase().trim() });

      if (!user) {
        throw new Error("Invalid email or password");
      }

      const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

      if (!isValid) {
        throw new Error("Invalid email or password");
      }

      return { id: user._id.toString(), email: user.email };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.unshift(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email || user.email.toLowerCase().trim() !== adminEmail) {
          // Reject any unauthorized Google account
          return "/admin/login?error=UnauthorizedGoogleAccount";
        }

        // Ensure admin user exists in DB
        await dbConnect();
        const existing = await User.findOne({ email: adminEmail });
        if (!existing) {
          const initialPasswordHash = await bcrypt.hash("789878", 10);
          await User.create({ email: adminEmail, passwordHash: initialPasswordHash });
        }
        return true;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
