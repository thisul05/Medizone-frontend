"use client";
import { useState, useMemo } from "react";
import { REPORTS_DATA, MOCK_PREVIEW_DATA } from "@/data/reports";
import { branches as pharmacyBranches } from "@/data/branches";
import { selectInventoryReports } from "@/lib/inventory-reports";
import { useInventoryState } from "@/lib/use-inventory-state";
import { ReportDialog, exportReport } from "./report-dialog";
import ForecastingPanel from "./forecasting-panel";
import Sidebar from "@/components/delivery/Sidebar";
import { Menu } from "lucide-react";
import {
  Search,
  Filter,
  FileText,
  Download,
  Building2,
  TrendingUp,
  Eye,
  CheckCircle2,
  Clock,
  ChevronRight,
  X,
  Grid,
  List,
  ChevronDown,
  FileSpreadsheet,
  Printer,
  reportIcons,
  ReportIcon,
} from "./report-icons";

export default function ReportsDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Reports");
  const [selectedBranch, setSelectedBranch] = useState("All Branches");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const { inventory, today } = useInventoryState();

  const branchId =
    pharmacyBranches.find((branch) => branch.name === selectedBranch)?.id ?? "all";
  const inventoryReports = useMemo(
    () => selectInventoryReports(inventory, today, branchId, startDateTime, endDateTime),
    [inventory, today, branchId, startDateTime, endDateTime]
  );
  const reports = useMemo(
    () => REPORTS_DATA.map((report) => ({ ...report, ...inventoryReports[report.id] })),
    [inventoryReports]
  );
  const activeReportModal = reports.find((report) => report.id === activeReportId) ?? null;
  const livePreview = activeReportId ? inventoryReports[activeReportId]?.preview : undefined;
  const preview = livePreview ?? (activeReportId ? MOCK_PREVIEW_DATA[activeReportId] : undefined);
  const dateRange =
    startDateTime || endDateTime
      ? `${startDateTime.replace("T", " ") || "Any start"} to ${
          endDateTime.replace("T", " ") || "Any end"
        } (Asia/Colombo)`
      : "All dates and times";

  // Categories list
  const categories = [
    "All Reports",
    "Sales & Finance",
    "Inventory & Stock",
    "HR & Attendance",
    "Regulatory & Clinical",
  ];

  // Branch Options
  const branches = [{ id: "all", name: "All Branches" }, ...pharmacyBranches];

  // Filter Logic
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesCategory =
        selectedCategory === "All Reports" || report.category === selectedCategory;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        report.title.toLowerCase().includes(searchLower) ||
        report.description.toLowerCase().includes(searchLower) ||
        report.tags.some((t) => t.toLowerCase().includes(searchLower)) ||
        report.category.toLowerCase().includes(searchLower);

      return matchesCategory && matchesSearch;
    });
  }, [reports, searchQuery, selectedCategory]);

  // Color helper function based on status
  const getBadgeStyle = (color: string) => {
    switch (color) {
      case "green":
        return "bg-[#e1f4ee] text-[#006450] border-[#c2e7dc]";
      case "amber":
        return "bg-[#fef3c7] text-[#92400e] border-[#fde68a]";
      case "blue":
        return "bg-[#e6f0fb] text-[#1d5aa6] border-[#bfdbfe]";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-[#0e1b2e] font-sans flex flex-col">
      {/* Mobile Topbar */}
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-[#072f68] px-4 text-white lg:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-md p-1.5 hover:bg-white/10 cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-base tracking-tight">medizone.lk</span>
        </div>
        <span className="text-xs text-white/80 font-medium">Reports</span>
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
              className="absolute top-4 right-3 p-1.5 text-white/80 hover:text-white rounded-md bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Page Header: Breadcrumbs, Title, Search & Branch */}
      <div className="w-full max-w-7xl mx-auto px-5 pt-6 pb-2 sm:px-6 lg:px-8">
        <p className="text-xs font-medium text-gray-500 mb-1">
          Back Office / Reports &amp; Analytics
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0e1b2e]">
              Reports &amp; Analytics Hub
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#46566d]">
              Sales audit, inventory valuation, narcotic register verification, and clinical compliance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <input
                type="text"
                aria-label="Search reports"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports or tags..."
                className="block w-full pl-9 pr-8 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#072f68] outline-none shadow-xs"
              />
              {searchQuery && (
                <button
                  aria-label="Clear search"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Branch Selector */}
            <div className="relative">
              <select
                aria-label="Branch context"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="appearance-none bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold py-2 pl-8 pr-7 rounded-lg border border-gray-300 cursor-pointer outline-none shadow-xs focus:ring-2 focus:ring-[#072f68]"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
              <Building2 className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-3 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="w-full max-w-7xl mx-auto px-5 py-6 sm:px-6 lg:px-8 space-y-6 flex-1">
        {/* Category Navigation Pills */}
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-2 min-w-max">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`h-8 px-3.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#072f68] text-white shadow-xs"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* View Mode Switcher */}
          <div className="hidden md:flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 shadow-xs">
            <button
              aria-label="grid view"
              aria-pressed={viewMode === "grid"}
              onClick={() => setViewMode("grid")}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#072f68] text-white shadow-xs font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> Cards
            </button>
            <button
              aria-label="table view"
              aria-pressed={viewMode === "table"}
              onClick={() => setViewMode("table")}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-[#072f68] text-white shadow-xs font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <List className="w-3.5 h-3.5" /> Detailed Table
            </button>
          </div>
        </div>

        {/* Filter Toolbar (Date Range) */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5" /> Filters:
            </div>

            <button
              onClick={() => {
                const parts = new Intl.DateTimeFormat("en-CA", {
                  timeZone: "Asia/Colombo",
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                }).formatToParts(new Date());
                const part = (type: string) => parts.find((item) => item.type === type)?.value;
                const todayFormatted = `${part("year")}-${part("month")}-${part("day")}`;
                setStartDateTime(`${todayFormatted}T00:00`);
                setEndDateTime(`${todayFormatted}T23:59`);
              }}
              className="rounded-lg bg-[#072f68] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#052350] cursor-pointer"
            >
              Today
            </button>

            <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-gray-600">
              <span className="text-[10px] text-gray-400">From date</span>
              <input
                type="datetime-local"
                value={startDateTime}
                max={endDateTime || undefined}
                onChange={(event) => {
                  const value = event.target.value;
                  setStartDateTime(value);
                  if (value && endDateTime && value > endDateTime) setEndDateTime(value);
                }}
                className="min-w-0 rounded-lg border border-gray-300 bg-gray-50 px-2.5 py-1 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-[#072f68]"
              />
            </label>
            <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-gray-600">
              <span className="text-[10px] text-gray-400">To date</span>
              <input
                type="datetime-local"
                value={endDateTime}
                min={startDateTime || undefined}
                onChange={(event) => {
                  const value = event.target.value;
                  setEndDateTime(value);
                  if (value && startDateTime && value < startDateTime) setStartDateTime(value);
                }}
                className="min-w-0 rounded-lg border border-gray-300 bg-gray-50 px-2.5 py-1 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-[#072f68]"
              />
            </label>
            {(startDateTime || endDateTime) && (
              <button
                onClick={() => {
                  setStartDateTime("");
                  setEndDateTime("");
                }}
                className="rounded-lg px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 cursor-pointer border border-gray-200"
              >
                Clear range
              </button>
            )}
            <span className="text-[11px] text-gray-400">Sri Lanka time (Asia/Colombo)</span>
          </div>

          <div className="text-xs text-gray-500 w-full md:w-auto text-right font-medium">
            Showing <span className="font-bold text-[#072f68]">{filteredReports.length}</span> of{" "}
            {REPORTS_DATA.length} operational reports
          </div>
        </div>

        {/* Reports Grid View */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredReports.map((report) => {
              const IconComponent = reportIcons[report.icon];
              return (
                <div
                  key={report.id}
                  className="bg-white rounded-xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-5">
                    {/* Top Row: Category & Status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">
                        {report.category}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-semibold whitespace-nowrap border ${getBadgeStyle(
                          report.statusColor
                        )}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                            report.statusColor === "green"
                              ? "bg-emerald-500"
                              : report.statusColor === "amber"
                              ? "bg-amber-500"
                              : report.statusColor === "blue"
                              ? "bg-sky-500"
                              : "bg-gray-400"
                          }`}
                        />
                        {report.status}
                      </span>
                    </div>

                    {/* Report Title */}
                    <h3 className="text-sm font-bold text-[#072f68] group-hover:text-blue-700 transition-colors mb-2">
                      <span className="leading-snug">{report.title}</span>
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-[#46566d] line-clamp-3 leading-relaxed mb-4">
                      {report.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {report.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded border border-gray-200"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Key Stats Indicator */}
                    <div className="bg-[#f8fafc] p-2.5 rounded-lg border border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-gray-500 text-[11px] font-medium">Metric Preview:</span>
                      <span className="font-bold text-[#072f68]">{report.stats}</span>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="bg-gray-50/70 px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-2 text-xs">
                    <span className="text-gray-400 text-[11px] font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {report.frequency}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveReportId(report.id)}
                        className="px-2.5 py-1 rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" /> Preview
                      </button>
                      <button
                        onClick={() => setActiveReportId(report.id)}
                        className="px-3 py-1 rounded-md bg-[#072f68] hover:bg-[#052350] text-white text-xs font-medium transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <FileText className="w-3 h-3" /> Run
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-[#f0f4f9] text-[#072f68] text-xs uppercase font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Report Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Frequency</th>
                    <th className="py-3 px-4">Current Metric / Stat</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#072f68] max-w-xs">
                        <div className="flex items-center gap-2">
                          <ReportIcon name={report.icon} className="w-4 h-4 text-[#072f68] shrink-0" />
                          <span>{report.title}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-medium">
                          {report.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-600">{report.frequency}</td>
                      <td className="py-3.5 px-4 font-bold text-gray-800">{report.stats}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getBadgeStyle(
                            report.statusColor
                          )}`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setActiveReportId(report.id)}
                            className="p-1.5 text-gray-500 hover:text-[#072f68] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            title="View Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setActiveReportId(report.id)}
                            className="px-3 py-1 bg-[#072f68] text-white rounded-md hover:bg-[#052350] font-medium flex items-center gap-1 cursor-pointer"
                          >
                            Generate <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty Search State */}
        {filteredReports.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200/80 p-12 text-center">
            <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#072f68] mb-1">
              No matching pharmacy reports found
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Try adjusting your search query, clearing category filters, or resetting the date range.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Reports");
                setStartDateTime("");
                setEndDateTime("");
              }}
              className="px-4 py-2 bg-[#072f68] text-white rounded-lg text-xs font-semibold hover:bg-[#052350] cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}

        <div className="mt-8">
          <ForecastingPanel branch={selectedBranch} dateRange={dateRange} />
        </div>
      </main>

      {/* Interactive Report Preview Modal / Drawer */}
      {activeReportModal && (
        <ReportDialog onClose={() => setActiveReportId(null)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#072f68] text-white p-5 flex items-center justify-between border-b border-[#052350]">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-lg text-emerald-400">
                  <ReportIcon name={activeReportModal.icon} className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-medium border border-emerald-500/30">
                      {activeReportModal.category}
                    </span>
                    <span className="text-xs text-blue-200">• {activeReportModal.frequency}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">{activeReportModal.title}</h3>
                </div>
              </div>
              <button
                aria-label="Close preview"
                onClick={() => setActiveReportId(null)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Sub-bar Controls */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4">
                <span className="text-gray-500">
                  Branch: <strong className="text-gray-800">{selectedBranch}</strong>
                </span>
                <span className="text-gray-500">
                  Timeframe: <strong className="text-gray-800">{dateRange}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportReport(activeReportModal, selectedBranch, dateRange, livePreview)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export CSV
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" /> Save as PDF
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-gray-600" /> Print
                </button>
              </div>
            </div>

            {/* Modal Interactive Content Preview */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <p className="text-xs text-gray-500">
                {livePreview
                  ? "Saved inventory for the selected branch. Stock and expiry reports show current balances; the date range filters adjustment history only."
                  : "Sample data only. Branch and timeframe are report parameters; values are fixed demo examples."}
              </p>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-xs text-blue-700 font-semibold uppercase">Total Reported Volume</p>
                  <p className="text-xl font-extrabold text-[#072f68] mt-1">{activeReportModal.stats}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <p className="text-xs text-[#006450] font-semibold uppercase">Verification Status</p>
                  <p className="text-xl font-extrabold text-[#006450] mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-5 h-5" /> {livePreview ? "Saved inventory" : "Sample data"}
                  </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                  <p className="text-xs text-[#92400e] font-semibold uppercase">
                    {livePreview ? "Inventory summary" : "Historical Comparison"}
                  </p>
                  <p className="text-xl font-extrabold text-[#92400e] mt-1 flex items-center gap-1">
                    <TrendingUp className="w-5 h-5" /> {activeReportModal.trend}
                    {livePreview ? "" : " vs last cycle"}
                  </p>
                </div>
              </div>

              {/* Data Table Preview */}
              {preview ? (
                <div>
                  <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                    {livePreview ? "Inventory records" : "Sample Data Preview (Top Rows)"}
                  </h4>
                  <div className="border border-gray-200 rounded-xl overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-700">
                      <thead className="bg-[#f0f4f9] text-[#072f68] font-bold">
                        <tr>
                          {preview.headers.map((h, i) => (
                            <th key={i} className="py-2.5 px-3 border-b border-gray-200">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {preview.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-gray-50">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="py-2.5 px-3">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center border border-dashed border-gray-300">
                  <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-700">Sample report overview</p>
                  <p className="text-[11px] text-gray-500 max-w-md mx-auto mt-1">
                    This prototype uses mock data. Detailed sample rows are available for Daily Sales and Expiry reports.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">
                Medizone report preview · {livePreview ? "Saved inventory" : "Sample data"} · Confidential internal record
              </span>
              <button
                aria-label="Close preview"
                onClick={() => setActiveReportId(null)}
                className="px-5 py-2 bg-[#072f68] hover:bg-[#052350] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </ReportDialog>
      )}
    </div>
  );
}
