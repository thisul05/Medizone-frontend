"use client";

import { branches, getBranchName } from "@/data/customers";
import type { BranchId } from "@/types/customers";
import { SearchInput, SelectField } from "./ui/Field";
import { Tabs } from "./ui/Tabs";

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

export function CustomerFilters({ search, onSearchChange, type, onTypeChange, branch, onBranchChange, counts }: CustomerFiltersProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-(--border) px-5 py-4 lg:flex-row lg:items-center">
      <SearchInput
        label="Search customers by name or phone number"
        placeholder="Search by name or phone, e.g. 077 123 4567"
        value={search}
        onChange={onSearchChange}
        className="lg:w-80"
      />
      <Tabs<CustomerTypeFilter>
        variant="pill"
        label="Customer type"
        idPrefix="customer-type"
        value={type}
        onChange={onTypeChange}
        tabs={[
          { id: "all", label: "All", count: counts.all },
          { id: "regular", label: "Regular", count: counts.regular },
          { id: "non_regular", label: "Non-regular", count: counts.non_regular },
        ]}
      />
      <SelectField
        label="Branch"
        labelHidden
        value={branch}
        onChange={(e) => onBranchChange(e.target.value as BranchId | "all")}
        options={[{ value: "all", label: "All branches" }, ...branches.map((b) => ({ value: b.id, label: getBranchName(b.id) }))]}
        containerClassName="lg:ml-auto lg:w-48"
      />
    </div>
  );
}
