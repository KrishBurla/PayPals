import React, { useState, useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { LayoutDashboard, Users, Activity, Settings, LogOut, ChevronLeft, Menu } from "lucide-react"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: window.location.pathname.includes('dashboard') },
  { icon: Users, label: "Groups", href: "/groups", badge: 3, active: window.location.pathname.includes('groups') },
  { icon: Settings, label: "Settings", href: "/settings", active: window.location.pathname.includes('settings') },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useContext(AuthContext)

  // We store the content here so we don't duplicate code
  const SidebarContent = (
    <>
      <div className="flex h-[88px] shrink-0 items-center justify-between border-b border-slate-100 px-6">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="PayPals" className="h-10 w-10 rounded-xl shadow-sm object-cover bg-white" />
          <span className="text-2xl font-black tracking-tight text-slate-900">PayPals</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 lg:hidden">
          <ChevronLeft className="h-6 w-6" />
        </button>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
        <p className="mb-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-400">Main Menu</p>
        {navItems.map((item) => (
          <a 
            key={item.label} 
            href={item.href} 
            className={`group flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold transition-all duration-200 ${item.active ? "bg-teal-50 text-teal-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
          >
            <item.icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${item.active ? "text-teal-600" : ""}`} />
            <span>{item.label}</span>
            {item.badge && <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-teal-500 px-1.5 text-[10px] font-black text-white">{item.badge}</span>}
          </a>
        ))}
      </nav>

      {user ? (
          <div className="shrink-0 border-t border-slate-100 p-4">
            <div className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 transition-colors hover:bg-slate-100">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white bg-indigo-100 font-bold text-indigo-600 shadow-sm uppercase">
                  {user.name ? user.name.split(' ').map(n=>n[0]).join('').substring(0,2) : "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">{user.name}</p>
                <p className="truncate text-xs font-medium text-slate-500">{user.email}</p>
              </div>
              <button onClick={() => { logout(); window.location.href='/login'; }} className="flex h-8 w-8 shrink-0 items-center justify-center text-slate-400 hover:text-slate-600"><LogOut className="h-4 w-4" /></button>
            </div>
          </div>
      ) : (
          <div className="shrink-0 border-t border-slate-100 p-4 text-center">
            <p className="text-xs font-bold text-slate-500">Not Logged In</p>
          </div>
      )}
    </>
  )

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="fixed left-4 top-4 z-40 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm lg:hidden"
      >
        <Menu className="h-5 w-5 text-slate-700" />
      </button>

      <aside className="flex fixed inset-y-0 left-0 z-[40] w-72 flex-col border-r border-slate-200 bg-white">
        {SidebarContent}
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={() => setIsOpen(false)} />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {SidebarContent}
      </aside>
    </>
  )
}