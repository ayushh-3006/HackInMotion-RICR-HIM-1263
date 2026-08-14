"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { DashboardOverview } from "@/components/dashboard/overview";

interface Stats {
  totalDrafts: number;
  totalInterviews: number;
  avgInterviewScore: number;
}

interface InterviewRecord {
  id: string;
  score: number;
  jobRole: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const [stats, setStats] = useState<Stats | null>(null);
  const [interviewHistory, setInterviewHistory] = useState<InterviewRecord[]>([]);

  const [atsHistory, setAtsHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

      const [statsRes, atsRes, interviewRes] = await Promise.all([
        fetch(`${baseUrl}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${baseUrl}/ats/history`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${baseUrl}/interview/history`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      let statsData = null;
      let atsData = [];
      let interviewData = [];

      if (statsRes.ok) {
        const statsJson = await statsRes.json();
        if (statsJson.success) statsData = statsJson.data;
      } else {
        console.warn(`Stats fetch failed with status: ${statsRes.status}`);
      }

      if (atsRes.ok) {
        const atsJson = await atsRes.json();
        if (atsJson.success) atsData = atsJson.data;
      } else {
        console.warn(`ATS history fetch failed with status: ${atsRes.status}`);
      }

      if (interviewRes.ok) {
        const interviewJson = await interviewRes.json();
        if (interviewJson.success) interviewData = interviewJson.data;
      } else {
        console.warn(`Interview history fetch failed with status: ${interviewRes.status}`);
      }

      setStats(statsData);
      setInterviewHistory(interviewData); 
      setAtsHistory(atsData);
    } catch (err) {
      console.warn("Dashboard fetchData network error or backend unavailable.");
      // Do not throw or use console.error to prevent Next.js red overlay.
      setStats(null);
      setInterviewHistory([]);
      setAtsHistory([]);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (isLoaded) fetchData();
  }, [isLoaded, fetchData]);

  useEffect(() => {
    if (user) {
      const syncUser = async () => {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
          await fetch(`${baseUrl}/users/sync`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              clerkUserId: user.id,
              email: user.emailAddresses[0]?.emailAddress,
              firstName: user.firstName,
              lastName: user.lastName,
              profilePicture: user.imageUrl,
            }),
          });
        } catch (error) {
          console.warn("Error syncing user:", error);
        }
      };

      syncUser();
    }
  }, [user]);

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-indigo-600 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">
            Loading your dashboard…
          </p>
        </div>
      </div>
    );
  }

  const firstName =
    user?.firstName ||
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    "there";

  return (
    <div id="dashboard-content" className="w-full h-full pb-10">
      <DashboardOverview
        userName={firstName}
        stats={stats}
        atsHistory={atsHistory}
        interviewHistory={interviewHistory}
      />
    </div>
  );
}
