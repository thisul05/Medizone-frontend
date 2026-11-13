"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/delivery/Sidebar";
import { Icon, type IconName } from "@/components/shared/Icon";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/shared/Toast";
import { branchName } from "@/data/branches";
import { getCustomerProfile } from "@/lib/auth-store";
import { formatDate, formatPhone } from "@/lib/format";
import { ROLE_LABELS, type ModuleId } from "@/types/roles";
import { defaultRouteFor } from "@/components/auth/useRedirectIfSignedIn";

const ALL_SYSTEM_MODULES: { id: ModuleId; label: string; icon: IconName; desc: string }[] = [
  { id: "admin", label: "Admin Dashboard", icon: "dashboard", desc: "Executive KPI overview & branch performance" },
  { id: "orders", label: "Orders & Prescriptions", icon: "clipboard", desc: "Customer prescriptions and counter orders" },
  { id: "inventory", label: "Inventory Management", icon: "package", desc: "Stock tracking, batches and expiry alerts" },
  { id: "customers", label: "Customer Records", icon: "users", desc: "Loyalty program, purchase history & profiles" },
  { id: "billing", label: "Billing & Counter POS", icon: "receipt", desc: "Point of sale checkout and cash reconciliation" },
  { id: "suppliers", label: "Suppliers & Purchasing", icon: "building", desc: "Supplier catalog and purchase order tracking" },
  { id: "delivery", label: "Delivery & Warranty", icon: "truck", desc: "Courier dispatch and warranty claims" },
  { id: "staff", label: "Staff & Payroll", icon: "id-card", desc: "Attendance logs and monthly salary calculation" },
  { id: "reports", label: "Reports & Analytics", icon: "chart", desc: "Branch revenue, daily sales & stock forecasts" },
];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ProfileView() {
  const { user, can, signOut } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa]">
        <div className="rounded-xl border border-gray-200/80 bg-white p-8 text-center shadow-xs">
          <p className="text-sm font-semibold text-gray-700">Loading profile...</p>
        </div>
      </div>
    );
  }

  const profile = user.customerId ? getCustomerProfile(user.customerId) : undefined;
  const isCustomer = user.role === "customer";

  const handleSignOut = () => {
    signOut();
    toast({ tone: "info", title: "You're signed out" });
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] text-[#0e1b2e]">
      {/* Desktop Permanent Sidebar */}
      <div className="hidden shrink-0 lg:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Topbar */}
        <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-[#072f68] px-4 text-white lg:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-md p-1.5 hover:bg-white/10"
              aria-label="Open sidebar"
            >
              <Icon name="menu" size={20} />
            </button>
            <span className="font-bold text-base tracking-tight">medizone.lk</span>
          </div>
          <span className="text-xs text-white/80 font-medium">User Profile</span>
        </header>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-10 w-nav max-w-[85vw] h-full shadow-2xl">
              <Sidebar />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-3 p-1.5 text-white/80 hover:text-white rounded-md bg-white/10"
              >
                <Icon name="x" size={18} />
              </button>
            </div>
          </div>
        )}

        <main id="main" className="flex-1 p-5 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Breadcrumb & Quick Link */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Link href={defaultRouteFor(user.role)} className="hover:text-[#072f68] transition">
                  {user.role === "owner" ? "Dashboard" : "Workspace"}
                </Link>
                <span>/</span>
                <span className="font-semibold text-gray-800">My Profile</span>
              </div>
              <Link
                href={defaultRouteFor(user.role)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 transition"
              >
                <Icon name="arrow-left" size={14} />
                <span>Return to Workspace</span>
              </Link>
            </div>

            {/* Profile Overview Card */}
            <section className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#072f68] text-xl font-bold text-white shadow-xs border-2 border-white/20">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl font-bold text-gray-900 tracking-tight sm:text-2xl">
                        {user.name}
                      </h1>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                      {user.jobTitle}
                      {!isCustomer && ` · ${ROLE_LABELS[user.role]}`}
                    </p>
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      {user.staffId && (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-mono font-medium text-gray-700">
                          <Icon name="id-card" size={12} className="text-gray-500" />
                          {user.staffId}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-200/60">
                        <Icon name="store" size={12} className="text-blue-500" />
                        {branchName(user.branchId)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/50 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 transition cursor-pointer"
                  >
                    <Icon name="logout" size={14} />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Two Column Grid: Account Details & Permissions */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Left Column: Account & Contact Details (7 cols) */}
              <section className="space-y-6 lg:col-span-7">
                <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <Icon name="user" size={16} className="text-[#072f68]" />
                      Account & Contact Information
                    </h2>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      Verified
                    </span>
                  </div>

                  <dl className="mt-4 divide-y divide-gray-100 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 py-2.5 gap-1">
                      <dt className="font-semibold text-gray-500">Full Name</dt>
                      <dd className="sm:col-span-2 font-medium text-gray-900">{user.name}</dd>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 py-2.5 gap-1">
                      <dt className="font-semibold text-gray-500">Job Title / Designation</dt>
                      <dd className="sm:col-span-2 font-medium text-gray-900">{user.jobTitle}</dd>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 py-2.5 gap-1">
                      <dt className="font-semibold text-gray-500">System Role</dt>
                      <dd className="sm:col-span-2 font-semibold text-[#072f68]">
                        {ROLE_LABELS[user.role]}
                      </dd>
                    </div>

                    {user.staffId && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 py-2.5 gap-1">
                        <dt className="font-semibold text-gray-500">Staff Employee ID</dt>
                        <dd className="sm:col-span-2 font-mono font-semibold text-gray-900">
                          {user.staffId}
                        </dd>
                      </div>
                    )}

                    {user.username && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 py-2.5 gap-1">
                        <dt className="font-semibold text-gray-500">Portal Username</dt>
                        <dd className="sm:col-span-2 font-mono text-gray-900">{user.username}</dd>
                      </div>
                    )}

                    {user.email && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 py-2.5 gap-1">
                        <dt className="font-semibold text-gray-500">Official Email</dt>
                        <dd className="sm:col-span-2 font-medium text-gray-900">{user.email}</dd>
                      </div>
                    )}

                    {user.phone && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 py-2.5 gap-1">
                        <dt className="font-semibold text-gray-500">Mobile Phone</dt>
                        <dd className="sm:col-span-2 font-mono text-gray-900">
                          {formatPhone(user.phone)}
                        </dd>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 py-2.5 gap-1">
                      <dt className="font-semibold text-gray-500">Assigned Branch</dt>
                      <dd className="sm:col-span-2 font-medium text-gray-900">
                        {branchName(user.branchId)}
                      </dd>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 py-2.5 gap-1">
                      <dt className="font-semibold text-gray-500">Account Created</dt>
                      <dd className="sm:col-span-2 text-gray-600">{formatDate(user.createdAt)}</dd>
                    </div>
                  </dl>
                </div>

                {profile && (
                  <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs">
                    <div className="border-b border-gray-100 pb-3">
                      <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <Icon name="file-text" size={16} className="text-[#072f68]" />
                        Customer Registration Details
                      </h2>
                    </div>
                    <dl className="mt-4 divide-y divide-gray-100 text-xs">
                      {profile.whatsapp && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 py-2.5 gap-1">
                          <dt className="font-semibold text-gray-500">WhatsApp Number</dt>
                          <dd className="sm:col-span-2 font-mono text-gray-900">
                            {formatPhone(profile.whatsapp)}
                          </dd>
                        </div>
                      )}
                      {profile.dateOfBirth && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 py-2.5 gap-1">
                          <dt className="font-semibold text-gray-500">Date of Birth</dt>
                          <dd className="sm:col-span-2 text-gray-900">{formatDate(profile.dateOfBirth)}</dd>
                        </div>
                      )}
                      {profile.addressLine && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 py-2.5 gap-1">
                          <dt className="font-semibold text-gray-500">Address</dt>
                          <dd className="sm:col-span-2 text-gray-900">{profile.addressLine}, {profile.city}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}
              </section>

              {/* Right Column: Module Access & Permissions (5 cols) */}
              <section className="space-y-6 lg:col-span-5">
                <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs">
                  <div className="border-b border-gray-100 pb-3">
                    <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <Icon name="shield-check" size={16} className="text-[#072f68]" />
                      System Permissions & Access
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                      Based on your role: <span className="font-semibold text-[#072f68]">{ROLE_LABELS[user.role]}</span>
                    </p>
                  </div>

                  <div className="mt-4 divide-y divide-gray-100">
                    {ALL_SYSTEM_MODULES.map((mod) => {
                      const hasAccess = can(mod.id);
                      return (
                        <div key={mod.id} className="py-2.5 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                                hasAccess
                                  ? "bg-[#072f68]/10 text-[#072f68]"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              <Icon name={mod.icon} size={14} />
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs font-semibold truncate ${hasAccess ? "text-gray-900" : "text-gray-400"}`}>
                                {mod.label}
                              </p>
                              <p className="text-[11px] text-gray-400 truncate">{mod.desc}</p>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {hasAccess ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
                                <Icon name="check" size={10} className="stroke-[3]" />
                                Access Granted
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                                <Icon name="lock" size={10} />
                                Restricted
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Direct Action Card */}
                <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-xs">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                    Active Workspace
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Ready to continue your shift? Go directly to your operational dashboard.
                  </p>
                  <Link
                    href={defaultRouteFor(user.role)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#072f68] hover:bg-[#052350] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition cursor-pointer"
                  >
                    <span>Open {user.role === "owner" ? "Admin Dashboard" : "Operational Module"}</span>
                    <Icon name="arrow-right" size={14} />
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
