"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  const cardStyle = {
    background: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    boxShadow: "0 4px 32px 2px #d3e9ff77",
    padding: "44px 40px",
    minWidth: 330,
    maxWidth: "90vw",
    marginTop: 40,
    textAlign: "center",
    border: "1.5px solid #dde9fa"
  };

  async function handleLogout() {
    // Clear local app session first
    await signOut({ redirect: false });

    // End the Keycloak SSO session with id_token_hint and return to Library "/"
    const issuer = "http://localhost:8080/realms/campus";
    const postLogout = "http://localhost:3001/"; // must be allow-listed in library-client
    const idToken = session?.idToken;

    if (idToken) {
      const url =
        `${issuer}/protocol/openid-connect/logout` +
        `?id_token_hint=${encodeURIComponent(idToken)}` +
        `&post_logout_redirect_uri=${encodeURIComponent(postLogout)}`;
      window.location.href = url;
    } else {
      window.location.href = postLogout; // fallback on first run after code change
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(120deg,#f9f6ff 0%,#caf7f6 70%,#dedfff 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      {!session ? (
        <div style={cardStyle}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#5541ac", marginBottom: 10 }}>
            📚 Library Portal
          </h1>
          <p style={{ color: "#674ea7", fontSize: 17, marginBottom: 30, fontWeight: 500 }}>
            Please sign in to access library resources.
          </p>
          <button
            onClick={() => signIn("keycloak")}
            style={{
              marginTop: 15,
              padding: "11px 42px",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 17,
              background: "linear-gradient(90deg,#6e63e9,#7fcaea 90%)",
              color: "#fff",
              border: "none",
              boxShadow: "0 2px 16px #e4bcf860",
              letterSpacing: 1,
              cursor: "pointer"
            }}>
            Login
          </button>
        </div>
      ) : (
        <div style={cardStyle}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#5c31c4", marginBottom: 10 }}>
            Welcome {session.user?.name || session.user?.email}
          </h1>
          <p style={{ color: "#7e57c2", fontSize: 17, fontWeight: 500 }}>
            Admission Number: {session.user?.sub}
          </p>
          <p style={{ margin: "18px 0 24px", color: "#48416b" }}>
            You now have access to all library resources.
          </p>
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 44px",
              borderRadius: 7,
              fontWeight: 600,
              fontSize: 16,
              background: "linear-gradient(90deg,#5e2efd,#73c8ef 100%)",
              color: "#fff",
              border: "none",
              boxShadow: "0 2px 12px #d2b9fc70",
              letterSpacing: 1,
              cursor: "pointer"
            }}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
