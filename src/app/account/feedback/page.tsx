import type { Metadata } from "next";
import { FeedbackView } from "@/components/account/FeedbackView";

// Customer account page: RouteGuard renders it only in the browser, after the session is read.
export const instant = false;

export const metadata: Metadata = { title: "My Feedback" };

export default function FeedbackPage() {
  return <FeedbackView />;
}
