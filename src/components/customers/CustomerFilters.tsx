"use client";

import { branches } from "@/data/customers";
import type { BranchId } from "@/types/customers";
import { InlineSelect, SearchInput } from "./ui/Field";

export type CustomerTypeFilter = "all" | "regular" | "non_regular";

interface CustomerFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  type: CustomerTypeFilter;
  onTypeChange: (value: CustomerTypeFilter) => void;
  branch: BranchId | "all";
  onBranchChange: (value: BranchId | "all") => void;
  counts: Record<CustomerTypeFilter, number>;
}

/** Search on the left; Customer Type (and Branch) selects on the right, as in the design. */
export function CustomerFilters({ search, onSearchChange, type, onTypeChange, branch, onBranchChange, counts }: CustomerFiltersProps) {
  return (
    <div className="flex flex-col gap-3 px-5 pt-5 pb-4 lg:flex-row lg:items-center">
      <SearchInput
        label="Search by customer name or phone"
        placeholder="Search by customer name or phone"
        value={search}
        onChange={onSearchChange}
        className="lg:w-[46%] lg:max-w-[520px]"
      />
      <div className="flex flex-col gap-3 sm:flex-row lg:ml-auto">
        <InlineSelect
          label="Branch"
          value={branch}
          onChange={(v) => onBranchChange(v as BranchId | "all")}
          options={[{ value: "all", label: "All branches" }, ...branches.map((b) => ({ value: b.id, label: b.name }))]}
          className="sm:w-60"
        />
        <InlineSelect
          label="Customer Type"
          value={type}
          onChange={(v) => onTypeChange(v as CustomerTypeFilter)}
          options={[
            { value: "all", label: `All (${counts.all})` },
            { value: "regular", label: `Regular (${counts.regular})` },
            { value: "non_regular", label: `Non-Regular (${counts.non_regular})` },
          ]}
          className="sm:w-[300px]"
        />
      </div>
    </div>
  );
}
