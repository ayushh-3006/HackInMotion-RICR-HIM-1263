"use client";

import React, { useState } from "react";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";

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
    setTimeout(() => setToasts((p) => p.filter((x) => x.id !== id)), 5000);
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { add, Toast } = useToast();
  const { signIn } = useSignIn();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      if (!signIn) return;
      await (signIn as any).create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      add({
        title: "Code Sent",
        description: "Please check your inbox.",
        type: "success",
      });
      setTimeout(() => router.push("/reset-password"), 1500);
    } catch (err: any) {
      add({
        title: "Error",
        description: err.errors?.[0]?.message || "Something went wrong.",
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
        {/* Back link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-violet-400 transition-colors w-fit"
        >
          <ArrowLeft size={13} />
          Back to Sign In
        </Link>

          <>
            {/* Header */}
            <div className="flex flex-col gap-1.5">
              <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/20">
                <Mail size={20} className="text-violet-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Forgot password?
              </h1>
              <p className="text-sm text-zinc-500">
                No worries. Enter your email and we&apos;ll send you a reset code.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="forgot-email"
                  className="text-xs font-medium text-zinc-400"
                >
                  Email Address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30"
                />
              </div>

              <motion.button
                whileTap={{ scale: email && !loading ? 0.97 : 1 }}
                type="submit"
                disabled={loading || !email}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Sending…
                  </>
                ) : (
                  "Send Reset Code"
                )}
              </motion.button>
            </form>
          </>

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
