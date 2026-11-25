"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function Nav() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUsername(data?.user?.username ?? null))
      .catch(() => setUsername(null));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUsername(null);
  }

  return (
    <header className="nav">
      <Link href="/" className="brand">抽卡账本</Link>
      <nav className="nav-links">
        {username ? (
          <>
            <span>{username}</span>
            <button className="ghost" onClick={logout}>退出</button>
          </>
        ) : (
          <>
            <Link href="/login">登录</Link>
            <Link href="/register">注册</Link>
          </>
        )}
      </nav>
    </header>
  );
}
