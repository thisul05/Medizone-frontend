import type { Metadata } from "next";
import { ProfileView } from "@/components/account/ProfileView";

// Customer account page: RouteGuard renders it only in the browser, after the session is read.
export const instant = false;

export const metadata: Metadata = { title: "My Profile" };

export default function ProfilePage() {
  return <ProfileView />;
}
