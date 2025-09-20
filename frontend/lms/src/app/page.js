"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  const cardStyle = {
    background: "rgba(255,255,255,0.96)",
    borderRadius: 20,
    boxShadow: "0 4px 34px 2px #dfe6fb88",
    padding: "44px 40px",
    minWidth: 330,
    maxWidth: "90vw",
    marginTop: 40,
    textAlign: "center",
    border: "1.5px solid #b6e0fa",
  };

  async function handleLogout() {
    // End app session
    await signOut({ redirect: false });

    // Require an ID token for Keycloak end-session when the server demands it
    const idToken = session?.idToken;
    const issuer = "http://localhost:8080/realms/campus";
    const postLogout = "http://localhost:3000/"; // must be allow-listed in client

    if (idToken) {
      const url =
        `${issuer}/protocol/openid-connect/logout` +
        `?id_token_hint=${encodeURIComponent(idToken)}` +
        `&post_logout_redirect_uri=${encodeURIComponent(postLogout)}`;
      window.location.href = url;
    } else {
      // Fallback: if no ID token (first run after code change), reload cleanly
      window.location.href = postLogout;
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(120deg,#fffdfe 0%,#def5fc 80%,#fffaff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {!session ? (
        <div style={cardStyle}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#1773b7", marginBottom: 12 }}>
            📖 LMS Portal
          </h1>
          <p style={{ color: "#426cad", fontSize: 17, marginBottom: 30, fontWeight: 500 }}>
            Access learning materials and assignments.
          </p>
          <button
            onClick={() => signIn("keycloak")}
            style={{
              marginTop: 15,
              padding: "11px 36px",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 17,
              background: "linear-gradient(90deg,#36b3fc,#a9d5ff 90%)",
              color: "#fff",
              border: "none",
              boxShadow: "0 2px 16px #a2c9ed80",
              letterSpacing: 1,
              cursor: "pointer",
            }}
          >
            Login with Admission Number
          </button>
        </div>
      ) : (
        <div style={cardStyle}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#2284cb", marginBottom: 10 }}>
            Welcome {session.user?.name || session.user?.email}
          </h1>
          <p style={{ color: "#5680a7", fontSize: 17, fontWeight: 500 }}>
            Admission Number: {session.user?.sub}
          </p>
          <p style={{ margin: "18px 0 24px", color: "#385265" }}>
            You are now connected to the LMS platform.
          </p>
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 40px",
              borderRadius: 7,
              fontWeight: 600,
              fontSize: 16,
              background: "linear-gradient(90deg,#1a63be,#51e9f5 100%)",
              color: "#fff",
              border: "none",
              boxShadow: "0 2px 12px #a4beee80",
              letterSpacing: 1,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
