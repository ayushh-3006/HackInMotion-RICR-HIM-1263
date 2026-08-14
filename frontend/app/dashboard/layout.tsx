"use client";

import React from "react";
import { Sidebar } from "@/components/dashboard/layout/sidebar";
import { Header } from "@/components/dashboard/layout/header";
import { Toaster } from "@/components/ui/sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
      {/* New Light Theme Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* New Light Theme Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>

      <Toaster position="bottom-right" richColors />
    </div>
  );
}
