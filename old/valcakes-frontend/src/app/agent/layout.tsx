// src/app/(agent)/layout.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ShoppingCart, ChefHat, Truck, LogOut, Cake } from "lucide-react";
import { useEffect, useState } from "react";

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("Agent");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserName(userData.full_name || userData.phone_number || "Agent");
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/agent", icon: LayoutDashboard },
    { name: "Orders & Payments", href: "/agent/orders", icon: ShoppingCart },
    { name: "Kitchen Board", href: "/agent/kitchen", icon: ChefHat },
    { name: "Dispatch", href: "/agent/dispatch", icon: Truck },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Cake className="text-pink-500" size={28} />
            <div>
              <h1 className="text-xl font-bold text-white">ValCakes</h1>
              <p className="text-xs text-gray-400">Agent Portal</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-b border-gray-800">
          <p className="text-sm text-gray-400">Logged in as</p>
          <p className="text-sm font-semibold text-white truncate">{userName}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? "bg-gradient-to-r from-pink-600 to-orange-500 text-white shadow-lg" 
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="m-4 flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}