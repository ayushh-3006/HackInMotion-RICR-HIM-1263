"use client";

import React, { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { ChatInterface } from "@/components/ai-builder/chat-interface";
import { ResumePreview } from "@/components/ai-builder/resume-preview";
import { Sparkles, Download, Save, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full w-full text-neutral-400">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    ),
  },
);
import CompactTheme from "@/components/ResumeThemes/CompactTheme";
import DefaultTheme from "@/components/ResumeThemes/DefaultTheme";
import ModernTheme from "@/components/ResumeThemes/ModernTheme";
import ProfessionalTheme from "@/components/ResumeThemes/ProfessionalTheme";
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AIResumeBuilderPage() {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [resumeData, setResumeData] = useState<any>({});
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleSendMessage = async (content: string) => {
    const newMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setIsSending(true);

    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/resume-builder/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            chatHistory: newMessages,
            currentData: resumeData,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to generate resume");

      setResumeData(data.data);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "I've updated your resume based on your input! Check the preview.",
        },
      ]);
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, I encountered an error while updating your resume.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const [theme, setTheme] = useState("default");

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      let DocumentComponent;

      switch (theme) {
        case "compact":
          DocumentComponent = (
            await import("@/components/ResumeThemes/CompactTheme")
          ).default;
          break;
        case "modern":
          DocumentComponent = (
            await import("@/components/ResumeThemes/ModernTheme")
          ).default;
          break;
        case "professional":
          DocumentComponent = (
            await import("@/components/ResumeThemes/ProfessionalTheme")
          ).default;
          break;
        default:
          DocumentComponent = (
            await import("@/components/ResumeThemes/DefaultTheme")
          ).default;
          break;
      }

      const blob = await pdf(<DocumentComponent data={resumeData} />).toBlob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Resume_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Resume exported successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const payloadData = { ...resumeData };
      delete payloadData.id;
      delete payloadData._id;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/resume-builder/save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: resumeData.basics?.fullName
              ? `${resumeData.basics.fullName}'s Resume`
              : "My Resume",
            theme,
            ...payloadData,
            id: draftId || undefined,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save draft");

      if (data.id) setDraftId(data.id);
      toast.success("Draft saved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save draft");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))]">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#1C4ED6]" />
            AI Resume Builder
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Chat with our AI to build your perfect resume
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-700 outline-none focus:ring-2 focus:ring-[#1C4ED6]"
          >
            <option value="default">Default Theme</option>
            <option value="compact">Compact Theme</option>
            <option value="modern">Modern Theme</option>
            <option value="professional">Professional Theme</option>
          </select>
          <button
            onClick={handleSaveDraft}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 font-medium text-sm transition-colors"
          >
            <Save size={16} /> Save Draft
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || Object.keys(resumeData).length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-[#1C4ED6] text-white rounded-lg hover:bg-[#1C4ED6]/90 disabled:opacity-50 font-medium text-sm transition-colors"
          >
            {isExporting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            Export PDF
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden mt-4 gap-6">
        {/* Left Side: Chat Interface */}
        <div className="w-1/3 flex flex-col min-w-[350px]">
          <ChatInterface
            messages={messages}
            isSending={isSending}
            onSendMessage={handleSendMessage}
          />
        </div>

        {/* Right Side: Resume Preview */}
        <div className="flex-1 overflow-hidden rounded-[20px] border border-neutral-200 bg-neutral-100 flex flex-col">
          {Object.keys(resumeData).length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-neutral-500 flex-col gap-2">
              <Sparkles className="w-8 h-8 opacity-50" />
              <p>Chat with AI to start building your resume</p>
            </div>
          ) : (
            <PDFViewer
              width="100%"
              height="100%"
              showToolbar={false}
              className="rounded-[20px] overflow-hidden border-none"
            >
              {theme === "compact" ? (
                <CompactTheme data={resumeData} />
              ) : theme === "modern" ? (
                <ModernTheme data={resumeData} />
              ) : theme === "professional" ? (
                <ProfessionalTheme data={resumeData} />
              ) : (
                <DefaultTheme data={resumeData} />
              )}
            </PDFViewer>
          )}
        </div>
      </div>
    </div>
  );
}
