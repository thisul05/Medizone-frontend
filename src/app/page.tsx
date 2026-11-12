import Link from "next/link";

// Temporary index so everyone can open their module page. Remove or replace it when the UI is finalized.
export default function Index() {
  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Medizone</h1>
      <ul className="flex flex-col gap-2">
        <li>
          <Link href="/home" className="underline">
            Module 1: Home
          </Link>
        </li>
        <li>
          <Link href="/admin" className="underline">
            Module 2: Admin dashboard
          </Link>
        </li>
        <li>
          <Link href="/inventory" className="underline">
            Module 3: Products and inventory
          </Link>
        </li>
        <li>
          <Link href="/orders" className="underline">
            Module 4: Prescriptions and orders
          </Link>
        </li>
        <li>
          <Link href="/customers" className="underline">
            Module 5: Customers and loyalty
          </Link>
        </li>
        <li>
          <Link href="/suppliers" className="underline">
            Module 6: Suppliers and purchases
          </Link>
        </li>
        <li>
          <Link href="/delivery" className="underline">
            Module 7: Delivery, returns and warranty
          </Link>
        </li>
        <li>
          <Link href="/billing" className="underline">
            Module 8: Billing and payments
          </Link>
        </li>
        <li>
          <Link href="/staff" className="underline">
            Module 9: Staff and payroll
          </Link>
        </li>
        <li>
          <Link href="/reports" className="underline">
            Module 10: Reports and forecasting
          </Link>
        </li>
        <li>
          <Link href="/login" className="underline">
            Module 1: Login
          </Link>
        </li>
      </ul>
    </main>
  );
}
