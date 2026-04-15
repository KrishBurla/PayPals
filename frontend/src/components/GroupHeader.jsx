import { useCurrency } from '../context/CurrencyContext';
import React from "react"
import { TrendingUp, Plus } from "lucide-react"

export function GroupHeader({ onAddExpense, onAddMember, group, users, totalExpenses }) {
  const { formatCurrency } = useCurrency();
  if (!group) return null;

  const members = group.members.map((id, index) => {
    const user = users.find(u => u.id === id);
    const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2) : "??";
    const colors = ["bg-indigo-100 text-indigo-600", "bg-pink-100 text-pink-600", "bg-blue-100 text-blue-600", "bg-emerald-100 text-emerald-600", "bg-purple-100 text-purple-600"];
    return { name: user?.name || "Unknown", color: colors[index % colors.length], initials: initials.toUpperCase() }
  });

  return (
    <div className="w-full relative overflow-hidden bg-slate-900 p-5 sm:p-6 lg:p-8 rounded-3xl shadow-xl shadow-slate-900/20 border border-slate-800">
      {/* Elegant Subdued Glow Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none translate-y-1/3 -translate-x-1/4"></div>

      <div className="relative z-10 flex flex-row items-center justify-between gap-4 w-full">

        {/* Left Side: Name and Spending */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white truncate">{group.name}</h1>
            <span className="rounded-full bg-teal-500/20 border border-teal-500/30 px-3 py-1 text-[10px] sm:text-xs font-bold text-teal-300 uppercase tracking-widest shrink-0 mt-0.5 sm:mt-1">Active</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 font-medium">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-teal-400" />
            <span className="text-sm sm:text-base">Total spent: <span className="font-bold text-white text-base sm:text-lg">{formatCurrency(totalExpenses || 0)}</span></span>
          </div>
        </div>

        {/* Right Side: ALWAYS stacked vertically, ALWAYS aligned right */}
        <div className="flex flex-col items-end gap-3 sm:gap-4 shrink-0">

          {/* Members Section (Above) */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden lg:block">Members</span>
            <div className="flex -space-x-2">
              {members.map((member, index) => (
                <div key={member.name + index} title={member.name} className={`h-9 w-9 sm:h-11 sm:w-11 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 border-slate-900 shadow-sm ${member.color}`} style={{ zIndex: members.length - index }}>
                  {member.initials}
                </div>
              ))}
              {/* Add Member Button */}
              <div onClick={onAddMember} title="Add Member" className="relative z-0 h-9 w-9 sm:h-11 sm:w-11 cursor-pointer rounded-full flex items-center justify-center bg-slate-800/50 text-slate-400 border-2 border-slate-700 border-dashed transition-all hover:scale-110 hover:border-teal-400 hover:text-teal-400 hover:bg-teal-900/40">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </div>

          {/* Action Button (Below) */}
          <button onClick={onAddExpense} className="flex h-10 sm:h-12 items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 px-4 sm:px-6 text-xs sm:text-sm font-bold text-white shadow-lg shadow-teal-500/20 transition-all hover:from-teal-400 hover:to-teal-300 hover:scale-[1.02] active:scale-95 shrink-0">
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" /> Add Expense
          </button>
        </div>

      </div>
    </div>
  )
}