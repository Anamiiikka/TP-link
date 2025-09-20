import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

export default NextAuth({
  providers: [
    KeycloakProvider({
      clientId: "admin-dashboard", // your Keycloak client id
      clientSecret: "",            // public client + PKCE in dev
      issuer: "http://localhost:8080/realms/campus",
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token; // needed for Keycloak end-session
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.idToken = token.idToken;   // expose to client
      return session;
    },
  },
});
