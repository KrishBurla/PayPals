import React, { useState } from "react"
import { UtensilsCrossed, Home, Car, Tv, ShoppingBag, Zap, Search, ChevronRight } from "lucide-react"

const categoryIcons = {
  food: { icon: UtensilsCrossed, color: "text-orange-500", bg: "bg-orange-100" },
  home: { icon: Home, color: "text-blue-500", bg: "bg-blue-100" },
  car: { icon: Car, color: "text-slate-500", bg: "bg-slate-100" },
  entertainment: { icon: Tv, color: "text-purple-500", bg: "bg-purple-100" },
  shopping: { icon: ShoppingBag, color: "text-pink-500", bg: "bg-pink-100" },
  utilities: { icon: Zap, color: "text-yellow-500", bg: "bg-yellow-100" },
}

const expenses = [
  { id: 1, category: "entertainment", description: "Netflix Subscription", date: "Apr 5, 2024", paidBy: "Sarah Chen", initials: "SC", color: "bg-pink-100 text-pink-600", total: 22.99, yourShare: 4.60, status: "owed" },
  { id: 2, category: "food", description: "Dinner at Olive Garden", date: "Apr 4, 2024", paidBy: "You", initials: "JD", color: "bg-indigo-100 text-indigo-600", total: 156.75, yourShare: 31.35, status: "lending" },
  { id: 3, category: "utilities", description: "Electric Bill - March", date: "Apr 3, 2024", paidBy: "Mike Wilson", initials: "MW", color: "bg-blue-100 text-blue-600", total: 185.40, yourShare: 37.08, status: "owed" },
  { id: 4, category: "shopping", description: "Costco Groceries", date: "Apr 2, 2024", paidBy: "Emily Davis", initials: "ED", color: "bg-emerald-100 text-emerald-600", total: 234.50, yourShare: 46.90, status: "owed" },
]

export function ExpenseLedger() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const filterTabs = ["All", "Food", "Home", "Car", "Entertainment"];

  const filtered = expenses.filter(ex => {
      const matchesSearch = ex.description.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "All" || ex.category.toLowerCase() === filter.toLowerCase();
      return matchesSearch && matchesFilter;
  });

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-6">
          <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h3 className="text-lg font-bold text-slate-900">Expense Ledger</h3>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" />
            </div>
          </div>
          {/* Claude's Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
              {filterTabs.map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`whitespace-nowrap rounded-lg px-4 py-1.5 text-xs font-bold transition-colors ${filter === f ? 'border border-teal-200 bg-teal-50 text-teal-600' : 'border border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                      {f}
                  </button>
              ))}
          </div>
      </div>

      <div className="divide-y divide-slate-50">
        {filtered.map((expense) => {
          const categoryData = categoryIcons[expense.category] || categoryIcons.food;
          const Icon = categoryData.icon;
          return (
            <div key={expense.id} className="group flex cursor-pointer items-center gap-4 px-6 py-5 transition-colors hover:bg-slate-50">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105 ${categoryData.bg}`}>
                <Icon className={`h-6 w-6 ${categoryData.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-slate-900">{expense.description}</p>
                <p className="mt-0.5 text-xs text-slate-500">{expense.date}</p>
              </div>
              <div className="hidden min-w-[140px] items-center gap-3 sm:flex">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${expense.color}`}>{expense.initials}</div>
                <div className="min-w-0">
                  <p className="truncate text-xs text-slate-500">{expense.paidBy === "You" ? "You paid" : `${expense.paidBy.split(' ')[0]} paid`}</p>
                  <p className="text-sm font-bold text-slate-900">${expense.total.toFixed(2)}</p>
                </div>
              </div>
              <div className="min-w-[80px] text-right">
                <p className="mb-1 text-xs text-slate-500">Your share</p>
                <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${expense.status === "lending" ? "bg-teal-50 text-teal-600" : "bg-rose-50 text-rose-600"}`}>
                  {expense.status === "lending" ? "+" : "-"}${expense.yourShare.toFixed(2)}
                </span>
              </div>
              <ChevronRight className="ml-2 h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-1" />
            </div>
          )
        })}
        {filtered.length === 0 && <div className="p-10 text-center text-sm font-medium text-slate-500">No expenses found for this filter.</div>}
      </div>
    </div>
  )
}