"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSignUp, useClerk } from "@clerk/nextjs";

// ── Toast hook (inline) ───────────────────────────────────────
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
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30"
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

// ── Password strength indicator ───────────────────────────────
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

// ── Main Register Page ────────────────────────────────────────
export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const router = useRouter();
  const { add, Toast } = useToast();
  const { signUp } = useSignUp();
  const clerk = useClerk();

  const isFormValid = Boolean(
    fullName && email && password && password.length >= 6,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !password) {
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

    setLoading(true);
    try {
      if (!signUp) return;

      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName: fullName,
      });

      const currentStatus = (result as any).status || signUp.status;
      const currentSessionId = (result as any).createdSessionId || signUp.createdSessionId;

      if (currentStatus === "complete") {
        add({
          title: "Account created!",
          description: "Welcome to AI Career Coach!",
          type: "success",
        });
        setTimeout(() => router.push("/dashboard"), 1000);
      } else {
        await (signUp as any).prepareEmailAddressVerification({ strategy: "email_code" });
        setPendingVerification(true);
      }
    } catch (err: any) {
      add({
        title: "Registration failed",
        description: err.errors?.[0]?.message || "Please check your details and try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp || !code) return;
    setLoading(true);
    try {
      const result = await (signUp as any).attemptEmailAddressVerification({ code });
      const currentStatus = (result as any).status || signUp.status;
      const currentSessionId = (result as any).createdSessionId || signUp.createdSessionId;

      if (currentStatus === "complete") {
        add({ title: "Account created!", description: "Welcome to AI Career Coach!", type: "success" });
        setTimeout(() => router.push("/dashboard"), 1000);
      } else {
        add({ title: "Verification incomplete", description: "Please try again.", type: "error" });
      }
    } catch (err: any) {
      add({ title: "Verification failed", description: err.errors?.[0]?.message || "Invalid code.", type: "error" });
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
        className="flex flex-col gap-7"
      >
        {/* Header */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Create your account
          </h1>
          <p className="text-sm text-zinc-500">
            {pendingVerification 
              ? "We've sent a code to your email. Enter it below to verify your account." 
              : "Join thousands of candidates who landed their dream jobs."}
          </p>
        </div>

        {/* Form */}
        {pendingVerification ? (
          <form
            onSubmit={handleVerify}
            noValidate
            className="flex flex-col gap-4"
          >
            <Input
              id="verify-code"
              label="Verification Code"
              value={code}
              onChange={setCode}
              placeholder="Enter 6-digit code"
            />
            
            <motion.button
              whileTap={{ scale: code && !loading ? 0.97 : 1 }}
              type="submit"
              disabled={loading}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Verifying…
                </>
              ) : (
                "Verify Email"
              )}
            </motion.button>
          </form>
        ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4"
        >
          <Input
            id="reg-name"
            label="Full Name"
            value={fullName}
            onChange={setFullName}
            placeholder="John Doe"
          />

          <Input
            id="reg-email"
            label="Email Address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
          />

          <div className="flex flex-col gap-1.5">
            <Input
              id="reg-password"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={setPassword}
              placeholder="Create a strong password"
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
            <PasswordStrength password={password} />
          </div>

          {/* Submit button */}
          <motion.button
            whileTap={{ scale: isFormValid && !loading ? 0.97 : 1 }}
            type="submit"
            disabled={loading}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Creating Account…
              </>
            ) : (
              "Create Account"
            )}
          </motion.button>

          <div id="clerk-captcha"></div>

          {/* Google Auth Button */}
          <button
            type="button"
            onClick={() => clerk.client.signUp.authenticateWithRedirect({ strategy: "oauth_google", redirectUrl: "/sso-callback", redirectUrlComplete: "/dashboard" })}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
        </form>
        )}

        {/* Terms */}
        <p className="text-center text-[11px] text-zinc-600 leading-relaxed">
          By creating an account, you agree to our{" "}
          <span className="text-zinc-400 hover:text-violet-400 cursor-pointer transition-colors">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="text-zinc-400 hover:text-violet-400 cursor-pointer transition-colors">
            Privacy Policy
          </span>
          .
        </p>

        {/* Sign in link */}
        <p className="text-center text-sm text-zinc-500">
          Already have an account?{" "}
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
