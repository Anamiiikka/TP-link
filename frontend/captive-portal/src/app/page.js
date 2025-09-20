"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  const cardStyle = {
    background: "rgba(255,255,255,0.90)",
    borderRadius: 20,
    boxShadow: "0 4px 32px 2px #d2e1fc99",
    padding: "42px 48px",
    minWidth: 340,
    marginTop: 40,
    maxWidth: "90vw",
    textAlign: "center",
    border: "1.5px solid #cff3ff"
  };

  async function handleLogout() {
    await signOut({ redirect: false });

    const issuer = "http://localhost:8080/realms/campus";
    const postLogout = "http://localhost:3003/"; // must be allow-listed in captive-portal client
    const idToken = session?.idToken;

    if (idToken) {
      const url =
        `${issuer}/protocol/openid-connect/logout` +
        `?id_token_hint=${encodeURIComponent(idToken)}` +
        `&post_logout_redirect_uri=${encodeURIComponent(postLogout)}`;
      window.location.href = url;
    } else {
      window.location.href = postLogout;
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(120deg, #e0edfc 0%, #fffbe2 70%, #e4ffe6 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      {!session ? (
        <div style={cardStyle}>
          <h1 style={{
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: 0.5,
            color: "#2288e2",
            marginBottom: 14
          }}>Wi‑Fi Captive Portal</h1>
          <p style={{
            color: "#44496a",
            fontSize: 18,
            marginBottom: 30,
            fontWeight: 500
          }}>
            Sign in to get network access.
          </p>
          <button
            onClick={() => signIn("keycloak")}
            style={{
              marginTop: 15,
              padding: "10px 44px",
              borderRadius: 7,
              fontWeight: 600,
              fontSize: 17,
              background: "linear-gradient(90deg,#4eb8f4,#6adec4 90%)",
              color: "#fff",
              border: "none",
              boxShadow: "0 2px 16px #bfefff70",
              letterSpacing: 1,
              cursor: "pointer"
            }}>
            Login
          </button>
        </div>
      ) : (
        <div style={cardStyle}>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#11b681",
            marginBottom: 12
          }}>
            Connected as {session.user?.name || session.user?.email}
          </h1>
          <p style={{
            fontSize: 18,
            color: "#3d7356",
            marginBottom: 10,
            fontWeight: 500
          }}>Admission Number: {session.user?.sub}</p>
          <p style={{ margin: "18px 0 24px", color: "#5a5b70" }}>
            You have secure network access.
          </p>
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 44px",
              borderRadius: 7,
              fontWeight: 600,
              fontSize: 16,
              background: "linear-gradient(90deg,#e14b6b,#5ac3cb 100%)",
              color: "#fff",
              border: "none",
              boxShadow: "0 2px 12px #f9bfc570",
              letterSpacing: 1,
              cursor: "pointer"
            }}>
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
