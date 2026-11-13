"use client";

import { useMemo, useState } from "react";
import { formatCustomerId, matchesCustomerSearch } from "@/lib/customers";
import type { BranchId } from "@/types/customers";
import { CustomerFilters, type CustomerTypeFilter } from "./CustomerFilters";
import { CustomerFormModal } from "./CustomerFormModal";
import { CustomerSummaryCards } from "./CustomerSummaryCards";
import { CustomerTable } from "./CustomerTable";
import { useCustomers } from "./CustomersProvider";
import { Button } from "./ui/Button";
import { Card, FootNote } from "./ui/Card";
import { EmptyState } from "./ui/EmptyState";
import { PageHeader } from "./ui/PageHeader";
import { Pagination, usePagination } from "./ui/Pagination";

const PAGE_SIZE = 8;

export function CustomersView() {
  const { customers, feedback, notify, storageNotice } = useCustomers();
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
  const pager = usePagination(visible, PAGE_SIZE, `${search}|${type}|${branch}|${lastAddedId ?? ""}`);

  function clearFilters() {
    setSearch("");
    setType("all");
    setBranch("all");
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Pharmacy" }, { label: "Customers" }]}
        title="Customer Management"
        description="View and manage registered customer information"
        action={
          <Button onClick={() => setAdding(true)} className="px-7">
            + Add Customer
          </Button>
        }
      />

      {storageNotice ? (
        <p role="alert" className="rounded-md border border-(--warning-solid)/40 bg-(--warning-bg) px-4 py-2.5 text-sm text-(--warning-ink)">
          {storageNotice}
        </p>
      ) : null}

      <CustomerSummaryCards customers={customers} feedback={feedback} />

      <Card as="section" aria-label="Customer list" className="overflow-hidden">
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
          <>
            <CustomerTable customers={pager.visible} highlightId={lastAddedId} />
            <div className="mt-1 border-t border-(--border)">
              <Pagination {...pager} onPageChange={pager.setPage} noun="customers" />
            </div>
          </>
        ) : customers.length === 0 ? (
          <EmptyState
            icon="users"
            title="No customers yet"
            description="Customers registered on Medizone.lk or added by staff will appear here."
            action={<Button onClick={() => setAdding(true)}>+ Add Customer</Button>}
          />
        ) : (
          <EmptyState
            icon="search"
            title="No customers found"
            description={
              search.trim()
                ? `No customer matches "${search.trim()}". Check the spelling, or search by phone number.`
                : "No customers match the selected filters."
            }
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
      <FootNote>Customer records: Medizone.lk registration or manual staff entry.</FootNote>

      <CustomerFormModal
        open={adding}
        onClose={() => setAdding(false)}
        onSaved={(customer) => {
          setAdding(false);
          clearFilters();
          setLastAddedId(customer.id);
          notify({
            tone: "success",
            title: "Customer added successfully",
            description: `${customer.name} (${formatCustomerId(customer.id)}) is now at the top of the customer list.`,
            action: { label: "View profile", href: `/customers/${customer.id}` },
          });
        }}
      />
    </>
  );
}
