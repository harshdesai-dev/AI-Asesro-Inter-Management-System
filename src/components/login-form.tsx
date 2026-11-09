"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to sign in.");
      window.location.assign("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-screen">
      <div className="login-glow login-glow-a"/><div className="login-glow login-glow-b"/>
      <section className="login-card">
        <div className="login-brand">
          <div className="brand-mark login-mark"><span>AI</span></div>
          <div><strong>AI ASESRO</strong><span>Intern<span className="gradient-text">Hub</span></span></div>
        </div>
        <div className="login-intro"><span className="eyebrow">INTERNAL WORKSPACE</span><h1>Welcome back</h1><p>Sign in to continue to your internship workspace.</p></div>
        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="email">Email address</label>
          <div className="login-input"><Mail size={17}/><input id="email" type="email" autoComplete="username" placeholder="you@ai-asesro.com" value={email} onChange={(e) => setEmail(e.target.value)} required/></div>
          <label htmlFor="password">Password</label>
          <div className="login-input"><LockKeyhole size={17}/><input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required/><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button className="login-submit" disabled={loading}>{loading ? "Signing in..." : "Sign in to InternHub"} <ArrowRight size={17}/></button>
        </form>
        <p className="login-foot">Secure access for AI ASESRO team members</p>
      </section>
      <div className="login-footer">© 2026 AI ASESRO InternHub</div>
    </main>
  );
}
