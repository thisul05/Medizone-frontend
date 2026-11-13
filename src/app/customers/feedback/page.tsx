import type { Metadata } from "next";
import { FeedbackView } from "@/components/customers/FeedbackView";

// Signed-in page: RouteGuard renders it only in the browser, after the session is read.
export const instant = false;

export const metadata: Metadata = {
  title: "Customer feedback · Medizone",
};

export default function CustomerFeedbackPage() {
  return <FeedbackView />;
}
