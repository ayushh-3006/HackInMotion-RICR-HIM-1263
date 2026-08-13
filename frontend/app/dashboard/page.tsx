'use client';

import React from "react";
import { useUser } from "@clerk/nextjs";
import { DashboardOverview } from "@/components/dashboard/overview";

export default function DashboardPage() {
  // Try to get the user's first name from Clerk, fallback to 'there'
  const { user } = useUser();
  const firstName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "Anit";

  return (
    <div className="w-full h-full pb-10">
      {/* 
        This renders the newly created light theme UI 
        that matches the mockup provided in the image.
      */}
      <DashboardOverview userName={firstName} />
    </div>
  );
}