import { useCurrency } from '../context/CurrencyContext';
import React from "react"
import { TrendingUp, Plus } from "lucide-react"

export function GroupHeader({ onAddExpense, onAddMember, group, users, totalExpenses }) {
  const { formatCurrency } = useCurrency();
  if (!group) return null;

  const members = group.members.map((id, index) => {
    const user = users.find(u => u.id === id);
    const initials = user?.name ? user.name.split(' ').map(n=>n[0]).join('').substring(0,2) : "??";
    const colors = ["bg-indigo-100 text-indigo-600", "bg-pink-100 text-pink-600", "bg-blue-100 text-blue-600", "bg-emerald-100 text-emerald-600", "bg-purple-100 text-purple-600"];
    return { name: user?.name || "Unknown", color: colors[index % colors.length], initials: initials.toUpperCase() }
  });

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-white p-6 lg:p-8 rounded-3xl shadow-sm border border-slate-200">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{group.name}</h1>
          <span className="rounded-full bg-teal-50 border border-teal-100 px-2.5 py-0.5 text-xs font-bold text-teal-600 uppercase tracking-wide">Active</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-slate-500">
          <TrendingUp className="h-4 w-4 text-teal-500" />
          <span className="text-sm"><span className="font-bold text-slate-900">{formatCurrency(totalExpenses || 0)}</span> spent</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex -space-x-3">
          <div onClick={onAddMember} title="Add Member" className="relative z-20 h-10 w-10 cursor-pointer rounded-full flex items-center justify-center bg-slate-100 text-slate-600 border-2 border-white shadow-sm transition-transform hover:scale-110">
              <Plus className="h-5 w-5" />
          </div>
          {members.map((member, index) => (
            <div key={member.name + index} title={member.name} className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm ${member.color}`} style={{ zIndex: members.length - index }}>
              {member.initials}
            </div>
          ))}
        </div>
        <button onClick={onAddExpense} className="flex h-11 items-center gap-2 rounded-xl bg-teal-500 px-5 text-sm font-bold text-white shadow-md shadow-teal-500/20 hover:bg-teal-600 transition-all active:scale-95">
          <Plus className="h-5 w-5" /> Add Expense
        </button>
      </div>
    </div>
  )
}