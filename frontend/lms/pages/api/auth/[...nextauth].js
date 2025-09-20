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
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // Initial sign in - capture tokens from account
      if (account) {
        console.log("JWT callback - account present:", {
          access_token: account.access_token ? "present" : "missing",
          id_token: account.id_token ? "present" : "missing",
        });
        
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at * 1000; // Convert to milliseconds
      }

      // Token is still valid
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Token has expired, try to refresh
      console.log("Access token expired, attempting refresh...");
      return await refreshAccessToken(token);
    },
    
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken;
      session.idToken = token.idToken;
      session.error = token.error;
      
      console.log("Session callback - tokens:", {
        accessToken: session.accessToken ? "present" : "missing",
        idToken: session.idToken ? "present" : "missing",
      });
      
      return session;
    },
  },
  
  // Enable debug messages in development
  debug: process.env.NODE_ENV === "development",
});

async function refreshAccessToken(token) {
  try {
    const url = "http://localhost:8080/realms/campus/protocol/openid-connect/token";
    
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      body: new URLSearchParams({
        client_id: "lms-client",
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.log("Error refreshing access token:", error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}
