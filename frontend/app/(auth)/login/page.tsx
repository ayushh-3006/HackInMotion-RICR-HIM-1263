"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ── Inline toast (no external dependency needed) ──────────────
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
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
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

// ── Input component ───────────────────────────────────────────
function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  suffix,
  id,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: React.ReactNode;
  id: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-zinc-400">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-violet-500/70 focus:bg-white/8 focus:ring-1 focus:ring-violet-500/30"
        />
        {suffix && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Login Page ───────────────────────────────────────────
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { add, Toast } = useToast();

  const isFormValid = Boolean(email && password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      add({
        title: "Missing information",
        description: "Please fill in all required fields.",
        type: "error",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      add({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        add({
          title: "Sign in failed",
          description: data.error || "Something went wrong.",
          type: "error",
        });
        return;
      }

      if (data.token) localStorage.setItem("token", data.token);

      add({
        title: "Welcome back!",
        description: "Redirecting to your dashboard…",
        type: "success",
      });
      setTimeout(() => router.push("/dashboard"), 1000);
    } catch {
      add({
        title: "Network error",
        description: "Please check your connection and try again.",
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
        {/* Header */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Sign in to account
          </h1>
          <p className="text-sm text-zinc-500">
            Welcome back! Enter your details to access your account.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4"
        >
          <Input
            id="login-email"
            label="Email Address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
          />

          <Input
            id="login-password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />

          {/* Forgot password */}
          <div className="flex justify-end -mt-1">
            <Link
              href="/forgot-password"
              className="text-xs text-zinc-500 hover:text-violet-400 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit button */}
          <motion.button
            whileTap={{ scale: isFormValid && !loading ? 0.97 : 1 }}
            type="submit"
            disabled={loading}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-indigo-500 hover:shadow-violet-500/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Signing In…
              </>
            ) : (
              "Sign In"
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center gap-3">
          <div className="h-px flex-1 bg-white/8" />
          <span className="text-[11px] text-zinc-600">
            New to AI Career Coach?
          </span>
          <div className="h-px flex-1 bg-white/8" />
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm text-zinc-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-violet-400 hover:text-violet-300 transition-colors"
          >
            Create Account
          </Link>
        </p>
      </motion.div>
    </>
  );
}
