import React, { useState } from "react"
import { cn } from "../lib/utils"
import { LayoutDashboard, Users, Activity, Settings, LogOut, ChevronLeft, Menu } from "lucide-react"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "#", active: true },
  { icon: Users, label: "Groups", href: "#", badge: 3 },
  { icon: Activity, label: "Activity", href: "#" },
  { icon: Settings, label: "Settings", href: "#" },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="fixed left-4 top-4 z-50 lg:hidden p-2 bg-white rounded-md shadow-sm">
        <Menu className="h-5 w-5 text-slate-700" />
      </button>

      {isOpen && <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden" onClick={() => setIsOpen(false)} />}

      <aside className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500">
              <span className="text-white font-bold">$</span>
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">SplitFlow</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-slate-500">
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                item.active ? "bg-teal-50 text-teal-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}>
              <item.icon className={cn("h-5 w-5 transition-transform duration-200 group-hover:scale-110", item.active ? "text-teal-600" : "")} />
              <span>{item.label}</span>
              {item.badge && <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-teal-500 px-1.5 text-xs font-bold text-white">{item.badge}</span>}
            </a>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-100">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm">JD</div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">John Doe</p>
              <p className="truncate text-xs text-slate-500">john@email.com</p>
            </div>
            <button className="h-8 w-8 text-slate-400 hover:text-slate-600 flex items-center justify-center"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </aside>
    </>
  )
}