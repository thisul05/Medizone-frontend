import type { BranchId } from "@/types/roles";

export interface Branch {
  id: BranchId;
  name: string;
  area: string;
  address?: string;
  /** False until the group confirms the location. */
  confirmed: boolean;
}

export const branches: Branch[] = [
  { id: "b1", name: "Miriswaththa", area: "Piliyandala", address: "238 1/B, Horana Road, Miriswaththa, Piliyandala", confirmed: true },
  { id: "b2", name: "Piliyandala", area: "Piliyandala town", confirmed: true },
  { id: "b3", name: "Kesbewa", area: "Address to be confirmed", confirmed: false },
  { id: "b4", name: "Moratuwa", area: "Idama, Moratuwa", address: "692 B, Galle Road, Idama, Moratuwa", confirmed: true },
  { id: "b5", name: "Thalawathugoda", area: "Address to be confirmed", confirmed: false },
];

export function getBranch(id: BranchId): Branch | undefined {
  return branches.find((b) => b.id === id);
}

export function branchName(id: BranchId | "all"): string {
  if (id === "all") return "All branches";
  return getBranch(id)?.name ?? id;
}
