import type { Metadata } from "next";
import { HomeView } from "@/components/home/HomeView";

// Signed-in page: RouteGuard renders it only in the browser, after the session is read.
export const instant = false;

export const metadata: Metadata = { title: "Home" };

export default function HomePage() {
  return <HomeView />;
}
