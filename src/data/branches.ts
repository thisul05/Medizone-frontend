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
  { id: "b1", name: "Branch 1", area: "Miriswaththa, Piliyandala", address: "238 1/B, Horana Road, Miriswaththa, Piliyandala", confirmed: true },
  { id: "b2", name: "Branch 2", area: "Piliyandala town", confirmed: true },
  { id: "b3", name: "Branch 3", area: "Location to be confirmed", confirmed: false },
  { id: "b4", name: "Branch 4", area: "Location to be confirmed", confirmed: false },
];

export function getBranch(id: BranchId): Branch | undefined {
  return branches.find((b) => b.id === id);
}

export function branchName(id: BranchId | "all"): string {
  if (id === "all") return "All branches";
  return getBranch(id)?.name ?? id;
}
