import React from "react"
import { UtensilsCrossed, Home, Car, Tv, ShoppingBag, Zap, Wifi, Search, ChevronRight } from "lucide-react"
import { cn } from "../lib/utils"

const categoryIcons = {
  food: { icon: UtensilsCrossed, color: "text-orange-500", bg: "bg-orange-100" },
  home: { icon: Home, color: "text-blue-500", bg: "bg-blue-100" },
  car: { icon: Car, color: "text-slate-500", bg: "bg-slate-100" },
  entertainment: { icon: Tv, color: "text-purple-500", bg: "bg-purple-100" },
  shopping: { icon: ShoppingBag, color: "text-pink-500", bg: "bg-pink-100" },
  utilities: { icon: Zap, color: "text-yellow-500", bg: "bg-yellow-100" },
  internet: { icon: Wifi, color: "text-cyan-500", bg: "bg-cyan-100" },
}

const expenses = [
  { id: 1, category: "entertainment", description: "Netflix Subscription", date: "Apr 5, 2024", paidBy: "Sarah Chen", initials: "SC", color: "bg-pink-100 text-pink-600", total: 22.99, yourShare: 4.60, status: "owed" },
  { id: 2, category: "food", description: "Dinner at Olive Garden", date: "Apr 4, 2024", paidBy: "You", initials: "JD", color: "bg-indigo-100 text-indigo-600", total: 156.75, yourShare: 31.35, status: "lending" },
  { id: 3, category: "utilities", description: "Electric Bill - March", date: "Apr 3, 2024", paidBy: "Mike Wilson", initials: "MW", color: "bg-blue-100 text-blue-600", total: 185.40, yourShare: 37.08, status: "owed" },
  { id: 4, category: "shopping", description: "Costco Groceries", date: "Apr 2, 2024", paidBy: "Emily Davis", initials: "ED", color: "bg-emerald-100 text-emerald-600", total: 234.50, yourShare: 46.90, status: "owed" },
]

export function ExpenseLedger() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-slate-900">Recent Expenses</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input placeholder="Search transactions..." className="w-full sm:w-64 rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" />
        </div>
      </div>
      
      <div className="divide-y divide-slate-50">
        {expenses.map((expense) => {
          const categoryData = categoryIcons[expense.category]
          const Icon = categoryData.icon
          const isYou = expense.paidBy === "You"
          
          return (
            <div key={expense.id} className="group flex items-center gap-4 px-6 py-5 transition-colors hover:bg-slate-50 cursor-pointer">
              <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105", categoryData.bg)}>
                <Icon className={cn("h-6 w-6", categoryData.color)} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-slate-900">{expense.description}</p>
                <p className="text-xs text-slate-500 mt-0.5">{expense.date}</p>
              </div>

              <div className="hidden sm:flex items-center gap-3 min-w-[140px]">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border ${expense.color}`}>{expense.initials}</div>
                <div className="min-w-0">
                  <p className="truncate text-xs text-slate-500">{isYou ? "You paid" : `${expense.paidBy.split(' ')[0]} paid`}</p>
                  <p className="text-sm font-bold text-slate-900">${expense.total.toFixed(2)}</p>
                </div>
              </div>

              <div className="text-right min-w-[80px]">
                <p className="text-xs text-slate-500 mb-1">Your share</p>
                <span className={cn("px-2.5 py-1 text-xs font-bold rounded-lg", expense.status === "lending" ? "bg-teal-50 text-teal-600" : "bg-rose-50 text-rose-600")}>
                  {expense.status === "lending" ? "+" : "-"}${expense.yourShare.toFixed(2)}
                </span>
              </div>

              <ChevronRight className="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-1 ml-2" />
            </div>
          )
        })}
      </div>
      <div className="border-t border-slate-100 p-4">
        <button className="w-full rounded-xl py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">View All Transactions</button>
      </div>
    </div>
  )
}