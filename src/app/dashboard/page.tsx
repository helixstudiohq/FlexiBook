import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard — FlexiBook",
  description:
    "Track total, confirmed, and pending bookings and manage every appointment from one sleek overview.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
