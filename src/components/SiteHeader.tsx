import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
      <nav className="max-w-4xl mx-auto flex items-center gap-6 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          {/* Briefcase icon (lucide-react) */}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-briefcase"><rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 3v4M8 3v4"/></svg>
          WageWise
        </Link>
        <Link href="/" className="hover:underline">Daily Log</Link>
        <Link href="/products" className="hover:underline">Products</Link>
        <Link href="/employee" className="hover:underline">Employee Ledger</Link>
      </nav>
    </header>
  );
} 