"use client";
import { useState, useMemo } from "react";
import { REPORTS_DATA, MOCK_PREVIEW_DATA, type Report } from "@/data/reports";
import { ReportDialog, exportReport } from "./report-dialog";
import MedizoneLogo from "./medizone-logo";
import ForecastingPanel from "./forecasting-panel";
import { Search, Filter, FileText, Download, Building2, TrendingUp, ShieldCheck, Eye, CheckCircle2, Clock, ChevronRight, X, Grid, List, ChevronDown, FileSpreadsheet, Printer, reportIcons, ReportIcon } from "./report-icons";
export default function ReportsDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Reports');
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [viewMode, setViewMode] = useState('grid');
  const [activeReportModal, setActiveReportModal] = useState<Report | null>(null);
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const dateRange = startDateTime || endDateTime
    ? `${startDateTime.replace('T', ' ') || 'Any start'} to ${endDateTime.replace('T', ' ') || 'Any end'} (Asia/Colombo)`
    : 'All dates and times';

  // Categories list
  const categories = [
    'All Reports',
    'Sales & Finance',
    'Inventory & Stock',
    'HR & Attendance',
    'Regulatory & Clinical'
  ];

  // Branch Options
  const branches = [
    { id: 'all', name: 'All Branches' },
    { id: 'miriswatta', name: 'Branch 1 - Miriswatta' },
    { id: 'piliyandala', name: 'Branch 2 - Piliyandala Main' },
    { id: 'maharagama', name: 'Branch 3 - Maharagama' },
    { id: 'nugegoda', name: 'Branch 4 - Nugegoda Express' }
  ];

  // Filter Logic
  const filteredReports = useMemo(() => {
    return REPORTS_DATA.filter((report) => {
      // Category match
      const matchesCategory =
        selectedCategory === 'All Reports' || report.category === selectedCategory;

      // Search match
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        report.title.toLowerCase().includes(searchLower) ||
        report.description.toLowerCase().includes(searchLower) ||
        report.tags.some((t) => t.toLowerCase().includes(searchLower)) ||
        report.category.toLowerCase().includes(searchLower);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  // Color helper function based on status
  const getBadgeStyle = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-[#e6f4ea] text-[#137333] border-[#ceebd5]';
      case 'amber':
        return 'bg-[#feefc3] text-[#b06000] border-[#fde293]';
      case 'blue':
        return 'bg-[#e8f0fe] text-[#1a73e8] border-[#c2e7ff]';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] text-slate-800 font-sans flex flex-col">
      {/* Top Banner Notice */}
      <div className="bg-[#0a2540] text-slate-200 text-xs py-2 px-4 sm:px-6 lg:px-8 border-b border-slate-700 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Pharmacist-run since 2018 · Quality, internationally recognised products
          </span>
        </div>
        <div className="flex items-center gap-6 text-slate-300">
          <span>Direct Helpline: +94 70 185 5855</span>
          <span>hello@medizone.lk</span>
          <span className="bg-[#0f385d] px-2.5 py-0.5 rounded text-white text-[11px] font-medium border border-slate-600">
            Staff Portal Preview
          </span>
        </div>
      </div>

      {/* Main Header / Branding Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Portal Title */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between">
            <div className="flex items-center gap-3">
              <MedizoneLogo />
              <div>
                <h1 className="text-lg font-bold text-[#0a2540] leading-tight flex items-center gap-2">
                  Pharmacy Reports Hub
                  <span className="text-xs bg-[#e6f4ea] text-[#137333] px-2 py-0.5 rounded-full font-semibold border border-[#ceebd5]">
                    Demo
                  </span>
                </h1>
                <p className="text-xs text-slate-500">Retail & Clinical Operations Analytics</p>
              </div>
            </div>

            {/* Mobile View Toggle */}
            <div className="flex md:hidden items-center gap-2">
              <button
                aria-label="grid view" aria-pressed={viewMode === "grid"} onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg border ${
                  viewMode === 'grid' ? 'bg-[#0a2540] text-white border-[#0a2540]' : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                aria-label="table view" aria-pressed={viewMode === "table"} onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg border ${
                  viewMode === 'table' ? 'bg-[#0a2540] text-white border-[#0a2540]' : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Search Header Bar */}
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="text" aria-label="Search reports"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by title, key metrics, SKU or tag..."
              className="block w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0a2540] focus:border-transparent transition-all outline-none"
            />
            {searchQuery && (
              <button
                aria-label="Clear search" onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Branch Selector & Active User Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <select
                aria-label="Branch context" value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="appearance-none bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2.5 pl-9 pr-8 rounded-xl border border-slate-200 cursor-pointer outline-none transition-colors"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
              <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-3.5 pointer-events-none" />
            </div>

            <div className="h-8 w-px bg-slate-200"></div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#0a2540] text-emerald-400 font-bold flex items-center justify-center text-xs">
                PH
              </div>
              <div className="text-left text-xs">
                <p className="font-semibold text-slate-800">Lead Pharmacist</p>
                <p className="text-[#137333] font-medium text-[11px]">Miriswaththa Unit</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner Section (Inspired by uploaded banner) */}
      <div className="bg-[#0a2540] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#13375b] px-3 py-1 rounded-full text-xs font-semibold text-emerald-300 mb-3 border border-[#1d4c7b]">
              <ShieldCheck className="w-3.5 h-3.5" /> Compliance & Financial Intelligence Center
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Pharmacy Reports & Compliance Portal
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Explore sample reports for sales audit, inventory valuation, narcotic register verification, and staff attendance across all pharmacy branches.
            </p>
          </div>

          {/* Quick Summary Pill Widget */}
          <div className="bg-[#113254] p-4 rounded-2xl border border-[#1b4673] flex items-center gap-4 w-full md:w-auto shadow-inner">
            <div className="bg-[#e6f4ea] text-[#137333] p-3 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-300 font-medium">Daily Operations Audit</p>
              <p className="text-lg font-bold text-white">Reports Overview</p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-emerald-300">
                <span>19 Report Templates</span>
                <span>•</span>
                <span>Sample Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Category Navigation Pills */}
        <div className="flex items-center justify-between gap-4 mb-6 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-2 min-w-max">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#0a2540] text-white shadow-md'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* View Mode Switcher (Desktop) */}
          <div className="hidden md:flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
            <button
              aria-label="grid view" aria-pressed={viewMode === "grid"} onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#0a2540] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-4 h-4" /> Cards
            </button>
            <button
              aria-label="table view" aria-pressed={viewMode === "table"} onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'table'
                  ? 'bg-[#0a2540] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" /> Detailed Table
            </button>
          </div>
        </div>

        {/* Filter Toolbar (Date and Time Range) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5" /> Filters:
            </div>

            <button
              onClick={() => {
                const parts = new Intl.DateTimeFormat('en-CA', {
                  timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit', day: '2-digit',
                }).formatToParts(new Date());
                const part = (type: string) => parts.find((item) => item.type === type)?.value;
                const today = `${part('year')}-${part('month')}-${part('day')}`;
                setStartDateTime(`${today}T00:00`);
                setEndDateTime(`${today}T23:59`);
              }}
              className="rounded-xl bg-[#0a2540] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0f385d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a2540]"
            >
              Today
            </button>

            <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-slate-600">
              From date and time
              <input
                type="datetime-local"
                value={startDateTime}
                max={endDateTime || undefined}
                onChange={(event) => {
                  const value = event.target.value;
                  setStartDateTime(value);
                  if (value && endDateTime && value > endDateTime) setEndDateTime(value);
                }}
                className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-[#0a2540]"
              />
            </label>
            <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-slate-600">
              To date and time
              <input
                type="datetime-local"
                value={endDateTime}
                min={startDateTime || undefined}
                onChange={(event) => {
                  const value = event.target.value;
                  setEndDateTime(value);
                  if (value && startDateTime && value < startDateTime) setStartDateTime(value);
                }}
                className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-[#0a2540]"
              />
            </label>
            {(startDateTime || endDateTime) && (
              <button
                onClick={() => { setStartDateTime(''); setEndDateTime(''); }}
                className="rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >Clear range</button>
            )}
            <span className="text-xs text-slate-500">Sri Lanka time (Asia/Colombo)</span>
          </div>

          <div className="text-xs text-slate-500 w-full md:w-auto text-right font-medium">
            Showing <span className="font-bold text-[#0a2540]">{filteredReports.length}</span> of {REPORTS_DATA.length} operational reports
          </div>
        </div>

        {/* Reports Grid View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredReports.map((report) => {
              const IconComponent = reportIcons[report.icon];
              return (
                <div
                  key={report.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-5">
                    {/* Top Row: Category & Status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-md">
                        {report.category}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getBadgeStyle(
                          report.statusColor
                        )}`}
                      >
                        {report.status}
                      </span>
                    </div>

                    {/* Report Title */}
                    <h3 className="text-base font-bold text-[#0a2540] group-hover:text-blue-700 transition-colors mb-2 flex items-start gap-2.5">
                      <div className="bg-[#e8f0fe] p-2 rounded-xl text-[#0a2540] shrink-0">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="leading-snug">{report.title}</span>
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                      {report.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {report.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Key Stats Indicator */}
                    <div className="bg-[#f8fafc] p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Metric Preview:</span>
                      <span className="font-bold text-[#0a2540]">{report.stats}</span>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {report.frequency}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveReportModal(report)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                      <button
                        onClick={() => setActiveReportModal(report)}
                        className="px-3 py-1.5 rounded-lg bg-[#0a2540] hover:bg-[#0f385d] text-white font-medium transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" /> Run
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-[#0a2540] text-white text-xs uppercase font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Report Name</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Frequency</th>
                    <th className="py-3.5 px-4">Current Metric / Stat</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-bold text-[#0a2540] max-w-xs">
                        <div className="flex items-center gap-2">
                          <ReportIcon name={report.icon} className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>{report.title}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium">
                          {report.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-600">{report.frequency}</td>
                      <td className="py-4 px-4 font-bold text-slate-800">{report.stats}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-semibold border ${getBadgeStyle(
                            report.statusColor
                          )}`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setActiveReportModal(report)}
                            className="p-1.5 text-slate-600 hover:text-[#0a2540] hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setActiveReportModal(report)}
                            className="px-3 py-1 bg-[#0a2540] text-white rounded-lg hover:bg-[#0f385d] font-medium flex items-center gap-1"
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
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#0a2540] mb-1">No matching pharmacy reports found</h3>
            <p className="text-xs text-slate-500 mb-4">
              Try adjusting your search query, clearing category filters, or clearing the date and time range.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All Reports');
                setStartDateTime('');
                setEndDateTime('');
              }}
              className="px-4 py-2 bg-[#0a2540] text-white rounded-xl text-xs font-semibold hover:bg-[#0f385d]"
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
        <ReportDialog onClose={() => setActiveReportModal(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#0a2540] text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2.5 rounded-xl text-emerald-400">
                  <ReportIcon name={activeReportModal.icon} className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-medium border border-emerald-500/30">
                      {activeReportModal.category}
                    </span>
                    <span className="text-xs text-slate-300">• {activeReportModal.frequency}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-0.5">{activeReportModal.title}</h3>
                </div>
              </div>
              <button
                aria-label="Close preview" onClick={() => setActiveReportModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Sub-bar Controls */}
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4">
                <span className="text-slate-500">
                  Branch: <strong className="text-slate-800">{selectedBranch}</strong>
                </span>
                <span className="text-slate-500">
                  Timeframe: <strong className="text-slate-800">{dateRange}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => exportReport(activeReportModal, selectedBranch, dateRange)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 font-medium flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export CSV
                </button>
                <button onClick={() => window.print()} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 font-medium flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-blue-600" /> Save as PDF
                </button>
                <button onClick={() => window.print()} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 font-medium flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5 text-slate-600" /> Print
                </button>
              </div>
            </div>

            {/* Modal Interactive Content Preview */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <p className="text-xs text-slate-500">Sample data only. Branch and timeframe are report parameters; values are fixed demo examples.</p>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#e8f0fe] p-4 rounded-xl border border-[#c2e7ff]">
                  <p className="text-xs text-blue-700 font-semibold uppercase">Total Reported Volume</p>
                  <p className="text-xl font-extrabold text-[#0a2540] mt-1">{activeReportModal.stats}</p>
                </div>
                <div className="bg-[#e6f4ea] p-4 rounded-xl border border-[#ceebd5]">
                  <p className="text-xs text-[#137333] font-semibold uppercase">Verification Status</p>
                  <p className="text-xl font-extrabold text-[#137333] mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-5 h-5" /> Sample data
                  </p>
                </div>
                <div className="bg-[#feefc3] p-4 rounded-xl border border-[#fde293]">
                  <p className="text-xs text-[#b06000] font-semibold uppercase">Historical Comparison</p>
                  <p className="text-xl font-extrabold text-[#b06000] mt-1 flex items-center gap-1">
                    <TrendingUp className="w-5 h-5" /> {activeReportModal.trend} vs last cycle
                  </p>
                </div>
              </div>

              {/* Data Table Preview (Sample context data) */}
              {MOCK_PREVIEW_DATA[activeReportModal.id] ? (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Sample Data Preview (Top Rows)
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-100 text-slate-700 font-bold">
                        <tr>
                          {MOCK_PREVIEW_DATA[activeReportModal.id].headers.map((h, i) => (
                            <th key={i} className="py-2.5 px-3 border-b border-slate-200">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {MOCK_PREVIEW_DATA[activeReportModal.id].rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50">
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
                <div className="bg-slate-50 rounded-xl p-8 text-center border border-dashed border-slate-300">
                  <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">Sample report overview</p>
                  <p className="text-[11px] text-slate-500 max-w-md mx-auto mt-1">
                    This prototype uses mock data. Detailed sample rows are available for Daily Sales and Expiry reports.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Medizone report preview ? Sample data · Confidential internal record
              </span>
              <button
                aria-label="Close preview" onClick={() => setActiveReportModal(null)}
                className="px-5 py-2 bg-[#0a2540] hover:bg-[#0f385d] text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </ReportDialog>
      )}

      {/* Modern Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="w-full px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          <p className="font-semibold text-[#0a2540]">
            Medizone Pharmacy Management System — Reports & Operational Analytics
          </p>
          <p className="mt-1 text-slate-400">
            Powered by Medizone LK · Safe Payments · Quality Internationally Recognized Products
          </p>
        </div>
      </footer>
    </div>
  );
}
