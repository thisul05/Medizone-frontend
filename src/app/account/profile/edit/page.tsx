import type { Metadata } from "next";
import { EditProfileView } from "@/components/account/EditProfileView";

// Customer account page: RouteGuard renders it only in the browser, after the session is read.
export const instant = false;

export const metadata: Metadata = { title: "Edit Profile" };

export default function EditProfilePage() {
  return <EditProfileView />;
}
