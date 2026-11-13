import Sidebar from "@/components/delivery/Sidebar";
import ReportsDashboard from "@/components/reports/reports-dashboard";

export default function ReportsPage() {
  return <div className="flex min-h-screen">
      <Sidebar />
      <main id="main" className="flex-1 overflow-y-auto">
        <ReportsDashboard />
      </main>
    </div>;
}
