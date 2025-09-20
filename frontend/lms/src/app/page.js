"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div style={{ padding: 24 }}>
        <h1>LMS Portal</h1>
        <button onClick={() => signIn("keycloak")}>
          Login with Admission Number
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Welcome {session.user?.name || session.user?.email}</h1>
      <p>Admission Number: {session.user?.sub}</p>
      <button onClick={() => signOut()}>Logout</button>
    </div>
  );
}
