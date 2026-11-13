import Sidebar from "@/components/delivery/Sidebar";
import ReportsDashboard from "@/components/reports/reports-dashboard";

export default function ReportsPage() {
  return (
    <div className="flex min-h-screen bg-[#f5f7fa] text-[#0e1b2e]">
      <div className="hidden shrink-0 lg:block">
        <Sidebar />
      </div>
      <main id="main" className="flex-1 overflow-y-auto min-w-0">
        <ReportsDashboard />
      </main>
    </div>
  );
}
