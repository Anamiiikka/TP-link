import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

export default NextAuth({
  providers: [
    KeycloakProvider({
      clientId: "library-client", // adjust for your actual client
      clientSecret: "",
      issuer: "http://localhost:8080/realms/campus",
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token; // Capture access token from Keycloak
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken; // Make access token available to client
      session.idToken = token.idToken;
      return session;
    },
  },
});
