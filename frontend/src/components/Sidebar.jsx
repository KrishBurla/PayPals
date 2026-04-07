import React, { useState } from "react"
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
      {/* Mobile Menu Button - Only visible on small screens */}
      <button onClick={() => setIsOpen(!isOpen)} className="fixed left-4 top-4 z-50 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm lg:hidden">
        <Menu className="h-5 w-5 text-slate-700" />
      </button>

      {/* Mobile Dark Overlay */}
      {isOpen && <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={() => setIsOpen(false)} />}

      {/* THE FIX: 'lg:static' means on large screens, it stops floating and sits permanently in the flex grid.
        'flex-shrink-0' ensures it never squishes down below 18rem (w-72).
      */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        <div className="flex h-[88px] items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 shadow-sm border border-teal-600">
              <span className="font-bold text-white text-lg">$</span>
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">SplitFlow</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 lg:hidden">
            <ChevronLeft className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
          <p className="mb-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-400">Main Menu</p>
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className={`group flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold transition-all duration-200 ${item.active ? "bg-teal-50 text-teal-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}>
              <item.icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${item.active ? "text-teal-600" : ""}`} />
              <span>{item.label}</span>
              {item.badge && <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-teal-500 px-1.5 text-[10px] font-black text-white">{item.badge}</span>}
            </a>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 transition-colors hover:bg-slate-100">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white bg-indigo-100 font-bold text-indigo-600 shadow-sm">JD</div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">John Doe</p>
              <p className="truncate text-xs font-medium text-slate-500">john@email.com</p>
            </div>
            <button className="flex h-8 w-8 shrink-0 items-center justify-center text-slate-400 hover:text-slate-600"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </aside>
    </>
  )
}