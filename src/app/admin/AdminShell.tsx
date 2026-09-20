"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Image as ImageIcon,
  Layers,
  MessageSquareQuote,
  Link2,
  FileText,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Database,
  Cloud,
  ShieldCheck,
  Inbox,
  HelpCircle,
  Newspaper,
  GitBranch,
  Brain,
} from "lucide-react";

interface AdminShellProps {
  children: React.ReactNode;
}

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "HIVE AI Brain", href: "/admin/brain", icon: Brain },
  { name: "Inquiries", href: "/admin/inquiries", icon: Inbox },
  { name: "Projects", href: "/admin/projects", icon: FolderKanban },
  { name: "Media Library", href: "/admin/media", icon: ImageIcon },
  { name: "Services", href: "/admin/services", icon: Layers },
  { name: "Process", href: "/admin/process", icon: GitBranch },
  { name: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
  { name: "FAQs", href: "/admin/faqs", icon: HelpCircle },
  { name: "Insights", href: "/admin/posts", icon: Newspaper },
  { name: "External Links", href: "/admin/links", icon: Link2 },
  { name: "Site Content", href: "/admin/content", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Do not render shell for public authentication pages
  const isAuthPage =
    pathname === "/admin/login" ||
    pathname === "/admin/forgot-password" ||
    pathname?.startsWith("/admin/reset-password") ||
    pathname?.startsWith("/admin/verify-email");

  if (isAuthPage) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050608] text-[#F5F7FA] flex flex-col md:flex-row antialiased">
      {/* Mobile Topbar */}
      <header className="md:hidden flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0A0D14]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-gradient-to-tr from-[#16C7FF] to-[#0D85FF] flex items-center justify-center font-bold text-black text-sm shadow-[0_0_15px_rgba(22,199,255,0.3)]">
            BH
          </div>
          <div>
            <div className="font-semibold text-sm leading-tight text-white">BrandHive Studio</div>
            <div className="text-[10px] text-white/50 tracking-wider uppercase font-mono">Admin Portal</div>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-white/5 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#090C12] border-r border-white/10 flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-gradient-to-tr from-[#16C7FF] to-[#0D85FF] flex items-center justify-center font-bold text-black text-base shadow-[0_0_20px_rgba(22,199,255,0.35)]">
                BH
              </div>
              <div>
                <div className="font-semibold text-base tracking-tight text-white">BrandHive Studio</div>
                <div className="text-[11px] text-[#16C7FF] tracking-wider uppercase font-medium">Admin Panel</div>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 text-white/50 hover:text-white"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Infrastructure Health Indicators */}
          <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02]">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-white/40 mb-2.5">
              Infrastructure Status
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 text-white/70">
                  <Database className="size-3.5 text-[#16C7FF]" />
                  <span>Turso DB</span>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 text-white/70">
                  <Cloud className="size-3.5 text-[#16C7FF]" />
                  <span>Cloudflare R2</span>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Ready
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[#16C7FF]/15 text-[#16C7FF] border border-[#16C7FF]/30 shadow-[0_0_15px_rgba(22,199,255,0.15)]"
                      : "text-white/70 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon className={`size-4.5 ${isActive ? "text-[#16C7FF]" : "text-white/50"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors border border-transparent"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="size-3.5 text-white/40" />
              View Public Website
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/50">Live</span>
          </Link>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-rose-400/90 hover:text-rose-300 hover:bg-rose-500/10 transition-colors border border-transparent"
          >
            <LogOut className="size-3.5" />
            <span>{isLoggingOut ? "Logging out..." : "Log Out"}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Topbar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-white/10 bg-[#090C12]/70 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider text-white/40 font-mono">BrandHive Studio CMS</span>
            <span className="text-white/20">/</span>
            <span className="text-sm font-medium text-white/90">
              {navItems.find((i) => (i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href)))?.name || "Admin"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs text-white/70">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              <span>Admin Authenticated</span>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="size-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}
    </div>
  );
}
