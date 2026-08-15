"use client";

import React, { useState, Suspense } from "react";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSignIn, useClerk } from "@clerk/nextjs";

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
              ? "border-red-500/30 bg-red-50 text-red-700"
              : "border-emerald-500/30 bg-emerald-50 text-emerald-700"
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

function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const { add, Toast } = useToast();
  const { signIn: _signIn } = useSignIn();
  const clerk = useClerk();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code) {
      add({
        title: "Code required",
        description: "Please enter the verification code.",
        type: "error",
      });
      return;
    }

    if (password.length < 8) {
      add({
        title: "Weak password",
        description: "Password must be at least 8 characters long.",
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

    setLoading(true);
    try {
      if (!clerk.client.signIn) return;

      const signInObj = clerk.client.signIn as any;
      const attemptFn = signInObj.attemptFirstFactor || signInObj.resetPassword;

      const result = await attemptFn.call(signInObj, {
        strategy: "reset_password_email_code",
        code: code.trim(),
        password,
      });

      if (result.status === "complete") {
        await clerk.setActive({ session: result.createdSessionId });
        setDone(true);
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        add({
          title: "Reset failed",
          description: "Could not complete the password reset.",
          type: "error",
        });
      }
    } catch (err: any) {
      console.error("Reset password error raw:", err);
      const errorMessage =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        String(err);
      add({
        title: "Reset failed",
        description: errorMessage,
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
              <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100">
                <ShieldCheck size={20} className="text-indigo-600" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Reset your password
              </h1>
              <p className="text-sm text-slate-500">
                Create a new strong password for your account.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-col gap-4"
            >
              {/* Verification Code */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="reset-code"
                  className="text-xs font-medium text-slate-500"
                >
                  Verification Code
                </label>
                <input
                  id="reset-code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter the 6-digit code"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:bg-slate-50 focus:ring-1 focus:ring-indigo-500/30"
                />
              </div>

              {/* New password */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="reset-password"
                  className="text-xs font-medium text-slate-500"
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
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:bg-slate-50 focus:ring-1 focus:ring-indigo-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="reset-confirm"
                  className="text-xs font-medium text-slate-500"
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
                    className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-1 ${
                      confirmPassword && confirmPassword !== password
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/30"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-[11px] text-red-500">
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
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100">
              <ShieldCheck size={24} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Password updated
              </h2>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Your password has been successfully reset. Redirecting you to
                the dashboard...
              </p>
            </div>
          </motion.div>
        )}

        <p className="text-center text-sm text-slate-500">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
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
    <Suspense fallback={<div className="text-slate-500 text-sm">Loading…</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
