// frontend/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { User, Session } from "next-auth";
import { JWT } from "next-auth/jwt";

import axios from "axios";

// Extend the built-in Session and User types
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id?: string;
      name?: string;
      email?: string;
      image?: string;
      role?: string;
      photos?: { title: string; src: string }[];
    } & User;
  }

  interface User {
    role?: string;
    photos?: { title: string; src: string }[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { params: { scope: "openid email profile" } },
    }),
  ],
  callbacks: {
    async signIn({ user, account }: { user: User; account?: any }) {
      if (account?.provider === "google") {
        try {
          console.log("Google user data:", {
            name: user.name,
            email: user.email,
            image: user.image,
          });
          const checkResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/users`,
            { params: { email: user.email } }
          );

          if (checkResponse.data.data && checkResponse.data.data.length > 0) {
            console.log("User exists:", checkResponse.data.data[0]);
            return true;
          }

          const payload = {
            name: user.name || "Unknown",
            email: user.email!,
            phone: "",
            password: "",
            provider: account.provider,
            providerId: account.providerAccountId,
            photos: user.image ? [{ title: "Profile", src: user.image }] : [],
            role: "user",
          };
          console.log("Registering user with payload:", payload);
          const registerResponse = await axios.post(
            `https://alibaapi.pino10.shop/v1/users/register`,
            payload
          );
          console.log("Register response:", registerResponse.data);

          return true;
        } catch (error: unknown) {
          const typedError = error as Error & {
            response?: { data?: { message?: string } };
          };
          console.error(
            "Error in Google sign-in:",
            typedError.response?.data || typedError.message
          );
          return `/auth/error?error=${encodeURIComponent(
            typedError.response?.data?.message || "Google sign-in failed"
          )}`;
        }
      }
      return true;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user && session.user.email) {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/users`,
            { params: { email: session.user.email } }
          );

          if (response.data.data && response.data.data.length > 0) {
            const user = response.data.data[0];
            session.user.id = user.id;
            session.user.role = user.role;
            session.user.photos = user.photos;
            session.accessToken = response.data.token || token.accessToken;
          }
        } catch (error) {
          console.error("Error fetching user data for session:", error);
        }
      }
      return session;
    },
    async jwt({ token, account }: { token: JWT; account?: any }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
  session: { strategy: "jwt" as const, maxAge: 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/auth/signin", error: "/auth/error" },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
