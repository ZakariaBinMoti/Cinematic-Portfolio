"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, useAnimationControls } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  GripVertical,
  Lock,
  Mail,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { Button, Input, Label } from "../_ui";

const features = [
  { icon: GripVertical, title: "Drag & drop everything", text: "Reorder projects, roles and skills in a single gesture." },
  { icon: MonitorSmartphone, title: "Live preview", text: "See changes on desktop, tablet and mobile instantly." },
  { icon: Sparkles, title: "Command palette", text: "Jump anywhere with Ctrl + K." },
];

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const controls = useAnimationControls();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { redirect: false, email, password });

    if (res?.error) {
      setLoading(false);
      setError("That email and password combination didn't work.");
      controls.start({ x: [0, -10, 10, -8, 8, -4, 4, 0], transition: { duration: 0.5 } });
      return;
    }

    // Only allow relative callback URLs to avoid open redirects.
    router.push(callbackUrl.startsWith("/") ? callbackUrl : "/admin");
    router.refresh();
  };

  const detectCaps = (e: React.KeyboardEvent) => setCapsLock(e.getModifierState?.("CapsLock") ?? false);

  return (
    <motion.div animate={controls} className="w-full max-w-[400px]">
      <div className="mb-8">
        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--a-gradient)] shadow-[0_10px_30px_-10px_rgba(139,92,246,0.8)]">
          <span className="text-lg font-bold tracking-tight text-white">Z</span>
        </div>
        <h1 className="text-[30px] font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1.5 text-sm text-[var(--a-text-muted)]">Sign in to manage your portfolio.</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/10 px-3.5 py-3 text-sm text-red-200"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </motion.div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <Label htmlFor="login-email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--a-text-subtle)]" />
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              autoFocus
              required
              placeholder="you@example.com"
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="login-password">Password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--a-text-subtle)]" />
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="pl-10 pr-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={detectCaps}
              onKeyDown={detectCaps}
            />
            <button
              type="button"
              id="login-toggle-password"
              onClick={() => setShowPassword((s) => !s)}
              className="a-focus absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[var(--a-text-subtle)] transition-colors hover:bg-white/5 hover:text-[var(--a-text)]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {capsLock && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-300">
              <TriangleAlert className="h-3.5 w-3.5" /> Caps Lock is on
            </p>
          )}
        </div>

        <Button id="login-submit" type="submit" size="lg" loading={loading} className="group mt-2 w-full">
          {loading ? "Signing in…" : "Sign in"}
          {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
        </Button>
      </form>

      <div className="mt-8 flex items-center justify-between text-xs text-[var(--a-text-subtle)]">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400/80" /> Encrypted session
        </span>
        <Link href="/" className="a-focus flex items-center gap-1 rounded transition-colors hover:text-[var(--a-text)]">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to portfolio
        </Link>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <main className="relative grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* ── Brand panel ── */}
      <section className="a-noise relative hidden overflow-hidden border-r border-[var(--a-border)] bg-[var(--a-bg-elevated)] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="a-aurora" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <div className="a-grid-bg absolute inset-0" aria-hidden />

        <div className="relative z-10 flex items-center gap-2.5 text-sm font-medium text-white/80">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
          Portfolio Studio
        </div>

        <div className="relative z-10 max-w-lg">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl font-semibold leading-[1.05] tracking-tight text-white"
          >
            Direct your story,
            <br />
            <span className="a-gradient-text">frame by frame.</span>
          </motion.h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/60">
            A focused studio for editing every scene of your cinematic portfolio — no code, no redeploys.
          </p>

          <ul className="mt-10 space-y-3">
            {features.map((f, i) => (
              <motion.li
                key={f.title}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.1, duration: 0.5 }}
                className="a-glass flex items-start gap-3.5 rounded-2xl p-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-violet-300">
                  <f.icon className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{f.title}</p>
                  <p className="mt-0.5 text-[13px] text-white/50">{f.text}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-white/35">© {new Date().getFullYear()} Zakaria Bin Moti</p>
      </section>

      {/* ── Form panel ── */}
      <section className="relative flex items-center justify-center overflow-hidden px-6 py-16">
        <div className="pointer-events-none absolute inset-0 lg:hidden" aria-hidden>
          <div className="a-aurora opacity-40">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className="relative z-10 flex w-full justify-center">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
