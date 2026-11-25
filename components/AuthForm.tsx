"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const res = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "失败了");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="wrap auth">
      <h1>{mode === "login" ? "登录" : "注册"}</h1>
      <form className="panel" onSubmit={submit}>
        <label className="field">
          用户名
          <input value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} maxLength={20} />
        </label>
        <label className="field" style={{ marginTop: 12 }}>
          密码
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button className="primary" style={{ marginTop: 16 }} type="submit">
          {mode === "login" ? "登录" : "注册并登录"}
        </button>
      </form>
    </main>
  );
}
