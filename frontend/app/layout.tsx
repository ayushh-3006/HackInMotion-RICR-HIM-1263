import { Toaster } from "react-hot-toast";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata = {
  title: "Resumind - AI Resume Builder & ATS Scanner",
  description: "Create, optimize, and analyze your resume with AI-powered tools.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-center" />
        <SonnerToaster position="top-right" richColors />
        {children}
      </body>
    </html>
  );
}