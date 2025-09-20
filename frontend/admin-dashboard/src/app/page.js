"use client";
import { useSession, signIn, signOut } from "next-auth/react";

function getRolesFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return new Set(payload?.realm_access?.roles || []);
  } catch {
    return new Set();
  }
}

export default function Home() {
  const { data: session } = useSession();

  async function handleLogout() {
    // Clear local NextAuth session without navigating yet
    await signOut({ redirect: false });

    // End the Keycloak SSO session and return to Admin "/"
    const issuer = "http://localhost:8080/realms/campus";
    const postLogout = "http://localhost:3002/"; // must be in Valid post logout redirect URIs
    const idToken = session?.idToken;

    if (idToken) {
      const url =
        `${issuer}/protocol/openid-connect/logout` +
        `?id_token_hint=${encodeURIComponent(idToken)}` +
        `&post_logout_redirect_uri=${encodeURIComponent(postLogout)}`;
      window.location.href = url;
    } else {
      // Fallback if no id_token yet (first run after code change)
      window.location.href = postLogout;
    }
  }

  if (!session) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Admin Dashboard</h1>
        <button onClick={() => signIn("keycloak")}>Login</button>
      </main>
    );
  }

  const roles = getRolesFromToken(session.accessToken || "");
  const isAdmin = roles.has("administrator");

  if (!isAdmin) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Access denied</h1>
        <p>Administrator role required.</p>
        <button onClick={handleLogout}>Logout</button>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Welcome {session.user?.name || session.user?.email}</h1>
      <p>Admission Number: {session.user?.sub}</p>
      <button onClick={handleLogout}>Logout</button>
    </main>
  );
}
