import type { Metadata } from "next";
import { FeedbackView } from "@/components/customers/FeedbackView";

export const metadata: Metadata = {
  title: "Customer feedback · Medizone",
};

export default function CustomerFeedbackPage() {
  return <FeedbackView />;
}
