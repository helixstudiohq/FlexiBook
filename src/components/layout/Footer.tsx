import Link from "next/link";
import { CalendarClock } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-950/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400">
            <CalendarClock className="h-4 w-4 text-white" />
          </span>
          <span className="font-semibold text-white">FlexiBook</span>
        </div>

        <nav className="flex items-center gap-6 text-sm text-slate-400">
          <Link href="/" className="transition-colors hover:text-white">
            Home
          </Link>
          <Link href="/book" className="transition-colors hover:text-white">
            Book
          </Link>
          <Link href="/dashboard" className="transition-colors hover:text-white">
            Dashboard
          </Link>
        </nav>

        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} FlexiBook. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
