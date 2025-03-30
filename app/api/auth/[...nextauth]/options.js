import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "../../../lib/mongodb";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) {
            console.log("Missing credentials");
            throw new Error("Please enter both username and password");
          }

          const { db } = await connectToDatabase();
          console.log("Looking for user:", credentials.username);
          
          const user = await db.collection("users").findOne({ 
            username: credentials.username 
          });

          if (!user) {
            console.log("No user found with username:", credentials.username);
            throw new Error("No user found with this username");
          }

          console.log("User found, verifying password");
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) {
            console.log("Invalid password for user:", credentials.username);
            throw new Error("Invalid password");
          }

          console.log("Authentication successful for user:", credentials.username);
          return {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw new Error(error.message || "Authentication failed");
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.profilePicture = user.profilePicture;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.profilePicture = token.profilePicture;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login", // Redirect to login page on error
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development", // Enable debug logs in development
}; 