"use client";

import { Suspense, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  Eye,
  EyeOff,
  GripVertical,
  HelpCircle,
  KeyRound,
  Lock,
  Mail,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  X,
} from "lucide-react";
import { Button, Input, Label } from "../_ui";
import { getAuthCapabilities, requestPasswordReset, resetPasswordWithCode } from "./actions";

const features = [
  {
    icon: GripVertical,
    title: "Drag & drop everything",
    text: "Reorder projects, roles, and skills in a single gesture.",
  },
  {
    icon: MonitorSmartphone,
    title: "Live dual-pane preview",
    text: "See changes on desktop, tablet, and mobile instantly.",
  },
  {
    icon: Sparkles,
    title: "Command palette",
    text: "Jump anywhere with Ctrl + K or press ? for shortcuts.",
  },
];

function GoogleIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" width="16" height="16" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/admin";
  const authErrorParam = params.get("error");

  // Mode: "login" | "forgot"
  const [view, setView] = useState<"login" | "forgot">("login");

  // Capabilities
  const [authCapabilities, setAuthCapabilities] = useState<{
    googleConfigured: boolean;
    adminEmail: string;
  }>({
    googleConfigured: false,
    adminEmail: "zakaria.binmoti@gmail.com",
  });
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [copiedRedirect, setCopiedRedirect] = useState(false);

  // Login form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Forgot Password states
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null);

  const controls = useAnimationControls();

  useEffect(() => {
    getAuthCapabilities().then((cap) => {
      setAuthCapabilities(cap);
      if (!email) {
        setEmail(cap.adminEmail);
        setForgotEmail(cap.adminEmail);
      }
    });

    if (authErrorParam === "UnauthorizedGoogleAccount" || authErrorParam === "AccessDenied") {
      setError(
        "Access denied: Google login is strictly restricted to zakaria.binmoti@gmail.com."
      );
      controls.start({ x: [0, -10, 10, -8, 8, -4, 4, 0], transition: { duration: 0.5 } });
    }
  }, [authErrorParam, controls, email]);

  // Handle Credentials Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email: email.trim(),
      password,
    });

    if (res?.error) {
      setLoading(false);
      setError("That email and password combination didn't work.");
      controls.start({ x: [0, -10, 10, -8, 8, -4, 4, 0], transition: { duration: 0.5 } });
      return;
    }

    router.push(callbackUrl.startsWith("/") ? callbackUrl : "/admin");
    router.refresh();
  };

  // Handle Google OAuth Click
  const handleGoogleSignIn = async () => {
    setError("");
    if (!authCapabilities.googleConfigured) {
      setShowGoogleModal(true);
      return;
    }

    setGoogleLoading(true);
    await signIn("google", {
      callbackUrl: callbackUrl.startsWith("/") ? callbackUrl : "/admin",
    });
  };

  // Handle Forgot Password - Step 1: Request Code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setForgotLoading(true);

    const res = await requestPasswordReset(forgotEmail.trim());
    setForgotLoading(false);

    if (!res.success) {
      setError(res.error || "Failed to request recovery code.");
      return;
    }

    if (res.devCode) {
      setDevCodeHint(res.devCode);
      setRecoveryCode(res.devCode); // Auto-fill for convenience
    }

    setSuccessMsg(res.message || "A verification code has been dispatched.");
    setForgotStep(2);
  };

  // Handle Forgot Password - Step 2: Confirm Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setForgotLoading(true);
    const res = await resetPasswordWithCode(
      forgotEmail.trim(),
      recoveryCode.trim(),
      newPassword
    );
    setForgotLoading(false);

    if (!res.success) {
      setError(res.error || "Failed to reset password.");
      return;
    }

    // Success! Return to login
    setEmail(forgotEmail.trim());
    setPassword("");
    setDevCodeHint(null);
    setForgotStep(1);
    setView("login");
    setSuccessMsg("Password reset successfully! Please sign in with your new password.");
  };

  const detectCaps = (e: React.KeyboardEvent) =>
    setCapsLock(e.getModifierState?.("CapsLock") ?? false);

  const copyRedirectUri = () => {
    const uri = typeof window !== "undefined"
      ? `${window.location.origin}/api/auth/callback/google`
      : "http://localhost:3000/api/auth/callback/google";
    navigator.clipboard.writeText(uri);
    setCopiedRedirect(true);
    setTimeout(() => setCopiedRedirect(false), 2000);
  };

  return (
    <motion.div animate={controls} className="w-full max-w-[420px]">
      {/* ── Brand Header ── */}
      <div className="mb-6">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--a-gradient)] shadow-[0_10px_30px_-10px_rgba(139,92,246,0.8)]">
          <span className="text-lg font-bold tracking-tight text-white">Z</span>
        </div>
        <h1 className="text-[28px] font-semibold tracking-tight">
          {view === "login" ? "Welcome back" : "Reset Password"}
        </h1>
        <p className="mt-1 text-sm text-[var(--a-text-muted)]">
          {view === "login"
            ? "Sign in to manage your cinematic portfolio."
            : "Recover your administrator access in two quick steps."}
        </p>
      </div>

      {/* ── Status Messages ── */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/10 px-3.5 py-3 text-sm text-red-200"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </motion.div>
      )}

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-3 text-sm text-emerald-200"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* ── VIEW 1: Standard Login ── */}
      {view === "login" && (
        <div className="space-y-4">
          {/* Google 1-Click Login Button */}
          <button
            type="button"
            id="google-login-btn"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white text-sm font-medium transition-all shadow-sm group hover:border-white/20 active:scale-[0.99]"
          >
            <GoogleIcon />
            <span>{googleLoading ? "Connecting to Google…" : "Continue with Google"}</span>
            <span className="ml-auto text-[10px] text-gray-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-md hidden sm:inline-block">
              {authCapabilities.adminEmail}
            </span>
          </button>

          {/* Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="w-full border-t border-white/10" />
            <span className="absolute bg-[#0f0f15] px-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium">
              or credentials
            </span>
          </div>

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
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="login-password">Password</Label>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setSuccessMsg("");
                    setForgotEmail(email || authCapabilities.adminEmail);
                    setView("forgot");
                  }}
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
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

            <Button
              id="login-submit"
              type="submit"
              size="lg"
              loading={loading}
              className="group mt-2 w-full shadow-lg"
            >
              {loading ? "Signing in…" : "Sign in to Dashboard"}
              {!loading && (
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              )}
            </Button>
          </form>
        </div>
      )}

      {/* ── VIEW 2: Forgot Password ── */}
      {view === "forgot" && (
        <div className="space-y-4">
          {forgotStep === 1 ? (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div>
                <Label htmlFor="forgot-email">Administrator Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--a-text-subtle)]" />
                  <Input
                    id="forgot-email"
                    type="email"
                    required
                    autoFocus
                    placeholder="zakaria.binmoti@gmail.com"
                    className="pl-10"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>
                <p className="text-[11px] text-[var(--a-text-subtle)] mt-1.5">
                  We will issue a secure 6-digit verification code to this address.
                </p>
              </div>

              <Button
                type="submit"
                size="lg"
                loading={forgotLoading}
                className="w-full gap-2 shadow-lg"
              >
                <KeyRound className="h-4 w-4" />
                {forgotLoading ? "Sending Code…" : "Request Recovery Code"}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSuccessMsg("");
                  setView("login");
                }}
                className="w-full text-center text-xs text-[var(--a-text-subtle)] hover:text-white transition-colors pt-1"
              >
                ← Back to regular sign-in
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {devCodeHint && (
                <div className="p-3 rounded-xl border border-violet-500/30 bg-violet-500/10 text-xs text-violet-200">
                  <span className="font-semibold block mb-0.5">Development Environment:</span>
                  Recovery code generated:{" "}
                  <code className="font-mono font-bold bg-white/10 px-1.5 py-0.5 rounded text-white">
                    {devCodeHint}
                  </code>{" "}
                  (auto-filled below).
                </div>
              )}

              <div>
                <Label htmlFor="recovery-code">6-Digit Verification Code</Label>
                <Input
                  id="recovery-code"
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  placeholder="e.g. 123456"
                  className="font-mono text-center tracking-widest text-lg font-bold"
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--a-text-subtle)]" />
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    required
                    placeholder="At least 6 characters"
                    className="pl-10 pr-11"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--a-text-subtle)]" />
                  <Input
                    id="confirm-password"
                    type={showNewPassword ? "text" : "password"}
                    required
                    placeholder="Confirm new password"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                loading={forgotLoading}
                className="w-full gap-2 shadow-lg"
              >
                <CheckCircle2 className="h-4 w-4" />
                {forgotLoading ? "Resetting…" : "Set New Password & Sign In"}
              </Button>

              <div className="flex items-center justify-between text-xs text-[var(--a-text-subtle)] pt-1">
                <button
                  type="button"
                  onClick={() => setForgotStep(1)}
                  className="hover:text-white transition-colors"
                >
                  ← Resend code
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setSuccessMsg("");
                    setView("login");
                  }}
                  className="hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ── Footer ── */}
      <div className="mt-8 flex items-center justify-between text-xs text-[var(--a-text-subtle)]">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400/80" /> Encrypted session
        </span>
        <Link
          href="/"
          className="a-focus flex items-center gap-1 rounded transition-colors hover:text-[var(--a-text)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to portfolio
        </Link>
      </div>

      {/* ── Google OAuth Setup Helper Modal ── */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#16161f] p-6 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <GoogleIcon />
                  <h3 className="text-base font-semibold text-white">
                    Google Sign-In Configuration
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3.5 text-xs text-gray-300">
                <p>
                  To enable 1-click Google sign-in strictly for{" "}
                  <strong className="text-white">{authCapabilities.adminEmail}</strong>, add your
                  Google OAuth credentials to your environment variables.
                </p>

                <div className="space-y-1.5 p-3 rounded-xl bg-black/50 border border-white/5">
                  <span className="text-[11px] text-gray-400 block font-medium">
                    1. Authorized Redirect URI for Google Cloud Console:
                  </span>
                  <div className="flex items-center gap-2">
                    <code className="text-[11px] text-violet-300 font-mono bg-white/5 px-2 py-1 rounded flex-1 truncate">
                      {typeof window !== "undefined"
                        ? `${window.location.origin}/api/auth/callback/google`
                        : "http://localhost:3000/api/auth/callback/google"}
                    </code>
                    <button
                      type="button"
                      onClick={copyRedirectUri}
                      className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white"
                      title="Copy URL"
                    >
                      {copiedRedirect ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 p-3 rounded-xl bg-black/50 border border-white/5">
                  <span className="text-[11px] text-gray-400 block font-medium">
                    2. Add these keys to your <code className="text-white">.env.local</code>:
                  </span>
                  <pre className="text-[11px] text-emerald-300 font-mono bg-white/5 p-2 rounded overflow-x-auto">
{`GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"`}
                  </pre>
                </div>

                <p className="text-[11px] text-gray-400">
                  🔒 NextAuth is already configured to automatically reject any Google account
                  other than <span className="text-gray-200">{authCapabilities.adminEmail}</span>.
                </p>
              </div>

              <div className="mt-5 flex justify-end">
                <Button
                  size="sm"
                  onClick={() => setShowGoogleModal(false)}
                  className="w-full sm:w-auto"
                >
                  Understood
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
            A focused studio for editing every scene of your cinematic portfolio — no code, no
            redeploys.
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

        <p className="relative z-10 text-xs text-white/35">
          © {new Date().getFullYear()} Zakaria Bin Moti
        </p>
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
          <Suspense fallback={<div className="text-sm text-gray-500">Loading…</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
