"use client";

import { Share, Loader2 } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "sonner";

export function Header() {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const generatePDF = async () => {
    try {
      setIsGeneratingPdf(true);
      toast.info("Preparing PDF report...", { id: "pdf-gen" });

      // We use native print to avoid html2canvas issues with modern CSS like oklch/lab
      setTimeout(() => {
        window.print();
        toast.success("Report ready!", { id: "pdf-gen" });
        setIsGeneratingPdf(false);
      }, 500);
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF report", { id: "pdf-gen" });
      setIsGeneratingPdf(false);
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-end pl-6 pr-4 sticky top-0 z-10">
      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-4">
        {/* Share Feedback Report */}
        <button
          onClick={generatePDF}
          disabled={isGeneratingPdf}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all hidden md:flex disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingPdf ? (
            <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
          ) : (
            <Share className="w-4 h-4 text-indigo-600" />
          )}
          Share Feedback Report
        </button>

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
