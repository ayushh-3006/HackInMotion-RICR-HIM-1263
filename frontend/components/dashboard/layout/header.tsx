"use client";

import { Share, Loader2, Calendar } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function Header() {
  const [mounted, setMounted] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const generatePDF = async () => {
    try {
      setIsGeneratingPdf(true);
      toast.info("Preparing PDF report…", { id: "pdf-gen" });

      const element = document.getElementById("dashboard-content");
      if (!element) {
        toast.error("Nothing to export yet.", { id: "pdf-gen" });
        setIsGeneratingPdf(false);
        return;
      }

      const html2pdf = (await import("html2pdf.js")).default;

      const opt = {
        margin: [0.4, 0.3, 0.4, 0.3],
        filename: `Dashboard_Report_${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" as const },
      };

      await html2pdf().set(opt).from(element).save();

      toast.success("Report downloaded!", { id: "pdf-gen" });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF report", { id: "pdf-gen" });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-end pl-6 pr-4 sticky top-0 z-10">
      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-4">
        {/* Real Date */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 shadow-sm transition-all hidden md:flex">
          <Calendar className="w-4 h-4 text-indigo-600" />
          {mounted ? (
            new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          ) : (
            <span className="opacity-0">Loading...</span>
          )}
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1"></div>

        {/* User Profile & Logout */}
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-10 h-10 shadow-sm border border-slate-200",
            },
          }}
        />
      </div>
    </header>
  );
}
