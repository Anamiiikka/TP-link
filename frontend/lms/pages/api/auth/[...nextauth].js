import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

export default NextAuth({
  providers: [
    KeycloakProvider({
      clientId: "lms-client",
      clientSecret: "", // public client + PKCE
      issuer: "http://localhost:8080/realms/campus",
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }) {
      // Capture fresh tokens on initial login/refresh
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token; // REQUIRED for id_token_hint
      }
      return token;
    },
    async session({ session, token }) {
      // Expose tokens to the client
      session.accessToken = token.accessToken || null;
      session.idToken = token.idToken || null;
      return session;
    },
  },
});
