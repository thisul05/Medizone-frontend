import StatusBadge from "@/components/shared/StatusBadge";

export default function Page() {
  return (
    <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mz-h1">Module 9: Staff and payroll</h1>
      <div className="mt-4 flex gap-2 rounded-pill bg-success-bg p-4 shadow-1">
        <StatusBadge kind="attendance" status="present" />
        <StatusBadge kind="attendance" status="absent" />
        <StatusBadge kind="attendance" status="partial" />
      </div>
    </main>
  );
}
