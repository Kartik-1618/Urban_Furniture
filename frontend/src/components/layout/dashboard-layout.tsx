import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Box, FileText, Settings, LogOut } from "lucide-react";
import Cookies from "js-cookie";

const navItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Contacts", href: "/contacts", icon: Users },
  { title: "Products", href: "/products", icon: Box },
  { title: "Chart of Accounts", href: "/accounts", icon: FileText },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const handleLogout = () => {
    Cookies.remove("token");
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen bg-[#F4F5F7]">
      <aside className="w-[260px] bg-[#003B95] flex flex-col text-white">
        <div className="h-16 flex items-center px-6 font-bold text-xl tracking-wide gap-3 border-b border-white/10">
          <div className="bg-[#0099FF] text-white h-8 w-8 flex items-center justify-center rounded text-sm font-extrabold">
            UF
          </div>
          Urban Furniture
        </div>
        <nav className="flex-1 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-6 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#0099FF] text-white border-l-4 border-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white border-l-4 border-transparent"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-2 w-full text-left rounded-md text-sm font-medium text-red-200 hover:bg-white/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm z-10">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search invoices, contacts, products"
                className="w-full pl-10 pr-4 py-2 rounded-md bg-muted/50 border-transparent focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
              />
              <svg className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-muted-foreground hover:text-foreground">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="flex items-center space-x-2 border rounded-full pl-1 pr-3 py-1 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="h-7 w-7 rounded-full bg-[#003B95] flex items-center justify-center text-white text-xs font-medium">
                GU
              </div>
              <span className="text-sm font-medium text-foreground">Guest User</span>
              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
