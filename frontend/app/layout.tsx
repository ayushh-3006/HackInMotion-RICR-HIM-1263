import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Resumind - AI Resume Builder & ATS Scanner",
  description:
    "Create, optimize, and analyze your resume with AI-powered tools.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${inter.variable} h-full w-full max-w-full overflow-x-hidden antialiased`}
        suppressHydrationWarning
      >
        <body
          suppressHydrationWarning
          className="relative w-full max-w-full overflow-x-hidden"
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster position="top-center" />
            <SonnerToaster position="top-right" richColors />
            {children}
            {/* Required by Clerk for Bot Protection (Smart CAPTCHA) */}
            <div id="clerk-captcha"></div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
