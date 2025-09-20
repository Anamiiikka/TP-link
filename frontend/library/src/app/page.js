"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Library Portal</h1>
        <button onClick={() => signIn("keycloak")}>Login</button>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Welcome {session.user?.name || session.user?.email}</h1>
      <p>Admission Number: {session.user?.sub}</p>
      <button onClick={() => signOut()}>Logout</button>
    </main>
  );
}
