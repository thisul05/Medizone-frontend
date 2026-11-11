import { StaffProvider } from "@/components/staff/StaffContext";
import type { ReactNode } from "react";

export const instant = false;

export default function StaffLayout({ children }: { children: ReactNode }) {
  return <StaffProvider>{children}</StaffProvider>;
}
