"use client";

import React, { useState, Suspense } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function useToast() {
  const [toasts, setToasts] = React.useState<
    { id: number; title: string; desc: string; type: "error" | "success" }[]
  >([]);
  const add = (t: {
    title: string;
    description: string;
    type: "error" | "success";
  }) => {
    const id = Date.now();
    setToasts((p) => [
      ...p,
      { id, title: t.title, desc: t.description, type: t.type },
    ]);
    setTimeout(() => setToasts((p) => p.filter((x) => x.id !== id)), 4000);
  };
  const Toast = () => (
    <div className="fixed top-5 right-5 z-[999] flex flex-col gap-2">
      {toasts.map((t) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-md ${
            t.type === "error"
              ? "border-red-500/30 bg-red-950/80 text-red-200"
              : "border-emerald-500/30 bg-emerald-950/80 text-emerald-200"
          }`}
        >
          <p className="font-semibold">{t.title}</p>
          <p className="text-xs opacity-80 mt-0.5">{t.desc}</p>
        </motion.div>
      ))}
    </div>
  );
  return { add, Toast };
}

function PasswordStrength({ password }: { password: string }) {
  const rules = [
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "Contains a number", pass: /\d/.test(password) },
    { label: "Contains a letter", pass: /[a-zA-Z]/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="flex flex-col gap-1 mt-1">
      {rules.map((r, i) => (
        <div key={i} className="flex items-center gap-1.5">
          {r.pass ? (
            <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
          ) : (
            <XCircle size={11} className="text-zinc-600 shrink-0" />
          )}
          <span
            className={`text-[11px] ${r.pass ? "text-emerald-400" : "text-zinc-600"}`}
          >
            {r.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { add, Toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      password.length < 8 ||
      !/\d/.test(password) ||
      !/[a-zA-Z]/.test(password)
    ) {
      add({
        title: "Weak password",
        description: "Password must meet all strength requirements.",
        type: "error",
      });
      return;
    }

    if (password !== confirmPassword) {
      add({
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical.",
        type: "error",
      });
      return;
    }

    if (!token) {
      add({
        title: "Invalid link",
        description: "This reset link is invalid or has expired.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        },
      );

      if (res.ok) {
        setDone(true);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        const data = await res.json();
        add({
          title: "Reset failed",
          description: data.error || "Link may have expired.",
          type: "error",
        });
      }
    } catch {
      add({
        title: "Network error",
        description: "Please check your connection.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast />
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="flex flex-col gap-8"
      >
        {!done ? (
          <>
            <div className="flex flex-col gap-1.5">
              <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/20">
                <ShieldCheck size={20} className="text-violet-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Reset your password
              </h1>
              <p className="text-sm text-zinc-500">
                Create a new strong password for your account.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-col gap-4"
            >
              {/* New password */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="reset-password"
                  className="text-xs font-medium text-zinc-400"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="reset-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a new password"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>

              {/* Confirm password */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="reset-confirm"
                  className="text-xs font-medium text-zinc-400"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="reset-confirm"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your new password"
                    className={`w-full rounded-lg border bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:ring-1 ${
                      confirmPassword && confirmPassword !== password
                        ? "border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20"
                        : "border-white/10 focus:border-violet-500/70 focus:ring-violet-500/30"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-[11px] text-red-400">
                    Passwords do not match
                  </p>
                )}
              </div>

              <motion.button
                whileTap={{ scale: !loading ? 0.97 : 1 }}
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Resetting…
                  </>
                ) : (
                  "Reset Password"
                )}
              </motion.button>
            </form>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-4 text-center"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/20">
              <ShieldCheck size={24} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Password reset!</h2>
              <p className="mt-2 text-sm text-zinc-500">
                Your password has been updated. Redirecting you to sign in…
              </p>
            </div>
          </motion.div>
        )}

        <p className="text-center text-sm text-zinc-500">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-semibold text-violet-400 hover:text-violet-300 transition-colors"
          >
            Sign In
          </Link>
        </p>
      </motion.div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-zinc-500 text-sm">Loading…</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
