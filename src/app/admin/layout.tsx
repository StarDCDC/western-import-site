"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    // Verifică autentificare
    if (status === "loading") return;
    
    if (!session?.user) {
      // Redirect la login
      router.replace('/login?callbackUrl=/admin');
      return;
    }

    // Verifică rol — doar ADMIN și MODERATOR pot accesa
    const role = (session.user as { role?: string }).role;
    if (!role || (role !== 'ADMIN' && role !== 'MODERATOR')) {
      // Dacă role lipsește din token (JWT vechi), forțează re-login
      // Navighează direct la login cu callback
      router.replace('/login?callbackUrl=/admin');
      return;
    }

    // Set admin info
    setAdminName(session.user.name || session.user.email?.split('@')[0] || 'Admin');
  }, [session, status, router]);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await import('next-auth/react').then(({ signOut }) => signOut({ callbackUrl: '/admin/login' }));
  };

  // Meniul admin
  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/products", label: "Produse", icon: "📦" },
    { href: "/admin/orders", label: "Comenzi", icon: "🛒" },
    { href: "/admin/categories", label: "Categorii", icon: "📁" },
    { href: "/admin/brands", label: "Branduri", icon: "🏷️" },
    { href: "/admin/blog", label: "Blog", icon: "📝" },
    { href: "/admin/faq", label: "FAQ", icon: "❓" },
    { href: "/admin/banners", label: "Bannere", icon: "🖼️" },
    { href: "/admin/pages", label: "Pagini", icon: "📄" },
    { href: "/admin/coupons", label: "Cupoane", icon: "🎫" },
    { href: "/admin/users", label: "Utilizatori", icon: "👥" },
    { href: "/admin/settings", label: "Setări", icon: "⚙️" },
  ];

  // Calculăm dacă e în dark mode
  useEffect(() => {
    const dm = localStorage.getItem("adminDarkMode");
    if (dm === "true") setDarkMode(true);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("adminDarkMode", String(darkMode));
  }, [darkMode]);

  if (status === "loading") return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Se încarcă...</div>;
  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="min-h-screen flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} ${collapsed ? "w-20" : "w-64"}`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700/50">
          {!collapsed && <span className="text-xl font-bold"><span className="text-amber-500">WI</span> Admin</span>}
          {collapsed && <span className="text-amber-500 font-bold text-lg mx-auto">WI</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:block text-slate-400 hover:text-white p-1">
            {collapsed ? "→" : "←"}
          </button>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white p-1">✕</button>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.href}
              onClick={() => { router.push(item.href); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition ${isActive(item.href) ? "bg-amber-500 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
              title={collapsed ? item.label : undefined}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        {!collapsed && (
          <div className="p-4 border-t border-slate-700/50">
            <button onClick={() => router.push("/")} className="text-sm text-slate-400 hover:text-white transition">← Înapoi la site</button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-600 dark:text-slate-300 p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <div className="hidden lg:block text-sm text-slate-500 dark:text-slate-400">
            {new Date().toLocaleDateString("ro-RO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {adminName[0]}
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{adminName}</span>
            </div>
            <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 ml-2 font-medium">
              Ieșire
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 bg-slate-50 dark:bg-slate-950 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
