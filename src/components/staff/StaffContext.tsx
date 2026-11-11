"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { staffMembers as seed, type StaffMember } from "@/data/staff";

interface StaffContextValue {
  staff: StaffMember[];
  addStaff: (member: StaffMember) => void;
  updateStaff: (id: string, data: Partial<StaffMember>) => void;
  deleteStaff: (id: string) => void;
  getStaff: (id: string) => StaffMember | undefined;
  nextId: () => string;
}

const StaffContext = createContext<StaffContextValue | null>(null);

export function StaffProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<StaffMember[]>(seed);

  const addStaff = useCallback((member: StaffMember) => {
    setStaff((prev) => [...prev, member]);
  }, []);

  const updateStaff = useCallback((id: string, data: Partial<StaffMember>) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  }, []);

  const deleteStaff = useCallback((id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const getStaff = useCallback(
    (id: string) => staff.find((s) => s.id === id),
    [staff],
  );

  const nextId = useCallback(() => {
    const max = staff.reduce((n, s) => {
      const num = parseInt(s.id.replace("EMP-", ""), 10);
      return num > n ? num : n;
    }, 0);
    return `EMP-${String(max + 1).padStart(3, "0")}`;
  }, [staff]);

  return (
    <StaffContext.Provider value={{ staff, addStaff, updateStaff, deleteStaff, getStaff, nextId }}>
      {children}
    </StaffContext.Provider>
  );
}

export function useStaff() {
  const ctx = useContext(StaffContext);
  if (!ctx) throw new Error("useStaff must be used inside StaffProvider");
  return ctx;
}
