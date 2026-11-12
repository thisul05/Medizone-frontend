"use client";

import { useMemo, useState } from "react";
import { normalizePhone } from "@/lib/customers";
import type { BranchId, Customer } from "@/types/customers";
import { CustomerFilters, type CustomerTypeFilter } from "./CustomerFilters";
import { CustomerFormModal } from "./CustomerFormModal";
import { CustomerSummaryCards } from "./CustomerSummaryCards";
import { CustomerTable } from "./CustomerTable";
import { useCustomers } from "./CustomersProvider";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { EmptyState } from "./ui/EmptyState";
import { PageHeader } from "./ui/PageHeader";

export function matchesCustomerSearch(customer: Pick<Customer, "name" | "phone">, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const digits = normalizePhone(q);
  return customer.name.toLowerCase().includes(q) || (digits.length >= 3 && customer.phone.includes(digits));
}

export function CustomersView() {
  const { customers, feedback, notify } = useCustomers();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<CustomerTypeFilter>("all");
  const [branch, setBranch] = useState<BranchId | "all">("all");
  const [adding, setAdding] = useState(false);
  const [lastAddedId, setLastAddedId] = useState<string>();

  const searched = useMemo(
    () => customers.filter((c) => matchesCustomerSearch(c, search) && (branch === "all" || c.branchId === branch)),
    [customers, search, branch],
  );
  const counts = {
    all: searched.length,
    regular: searched.filter((c) => c.isRegular).length,
    non_regular: searched.filter((c) => !c.isRegular).length,
  };
  const visible = searched.filter((c) => type === "all" || (type === "regular" ? c.isRegular : !c.isRegular));
  const filtersActive = search.trim() !== "" || type !== "all" || branch !== "all";

  function clearFilters() {
    setSearch("");
    setType("all");
    setBranch("all");
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customer management"
        description="Customer records, regular-customer discounts and loyalty balances for all four branches."
        action={
          <Button icon="plus" onClick={() => setAdding(true)}>
            Add customer
          </Button>
        }
      />

      <CustomerSummaryCards customers={customers} feedback={feedback} />

      <Card as="section" aria-labelledby="customer-list-title" className="overflow-hidden">
        <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 pt-4">
          <h2 id="customer-list-title" className="text-lg leading-6 font-semibold">
            Customers
          </h2>
          <p className="text-[13px] text-(--ink-muted)" aria-live="polite">
            Showing {visible.length} of {customers.length} customers
          </p>
        </div>
        <CustomerFilters
          search={search}
          onSearchChange={setSearch}
          type={type}
          onTypeChange={setType}
          branch={branch}
          onBranchChange={setBranch}
          counts={counts}
        />
        {visible.length > 0 ? (
          <CustomerTable customers={visible} highlightId={lastAddedId} />
        ) : customers.length === 0 ? (
          <EmptyState
            icon="users"
            title="No customers yet"
            description="Customers you add here are shared with Billing, Orders and Delivery."
            action={
              <Button icon="plus" onClick={() => setAdding(true)}>
                Add customer
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon="search"
            title="No customers match these filters"
            description={search.trim() ? `Nothing found for "${search.trim()}". Check the spelling or search by phone number.` : "Try another customer type or branch."}
            action={
              filtersActive ? (
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        )}
      </Card>

      <CustomerFormModal
        open={adding}
        onClose={() => setAdding(false)}
        onSaved={(customer) => {
          setAdding(false);
          clearFilters();
          setLastAddedId(customer.id);
          notify({
            tone: "success",
            title: "Customer added",
            description: `${customer.name} (${customer.id}) is now in the customer list.`,
            action: { label: "View profile", href: `/customers/${customer.id}` },
          });
        }}
      />
    </div>
  );
}
