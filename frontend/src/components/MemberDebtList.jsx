import React from "react"
import { ArrowRight, Check } from "lucide-react"
import { cn } from "../lib/utils"

const memberDebts = [
  { id: 1, name: "Sarah Chen", initials: "SC", color: "bg-pink-100 text-pink-600", amount: 87.25, direction: "owes_you", lastActivity: "Netflix, Groceries" },
  { id: 2, name: "Mike Wilson", initials: "MW", color: "bg-blue-100 text-blue-600", amount: 37.08, direction: "you_owe", lastActivity: "Electric Bill" },
  { id: 3, name: "Emily Davis", initials: "ED", color: "bg-emerald-100 text-emerald-600", amount: 158.55, direction: "owes_you", lastActivity: "Costco" }
]

export function MemberDebtList() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Member Balances</h3>
        <button className="text-xs font-bold text-teal-600 hover:text-teal-700">View Details</button>
      </div>
      
      <div className="space-y-6">
        {memberDebts.map((debt) => {
          const owesYou = debt.direction === "owes_you"
          return (
            <div key={debt.id} className="group rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold border border-white shadow-sm ${debt.color}`}>{debt.initials}</div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{debt.name}</p>
                    <p className={cn("text-xs font-medium mt-0.5", owesYou ? "text-teal-600" : "text-rose-600")}>{owesYou ? "owes you" : "you owe"}</p>
                  </div>
                </div>
                <p className={cn("text-lg font-bold", owesYou ? "text-teal-600" : "text-rose-600")}>${debt.amount.toFixed(2)}</p>
              </div>
              <p className="mt-3 text-xs text-slate-500">Last: {debt.lastActivity}</p>
              <div className="mt-4 flex gap-2">
                <button className="flex flex-1 items-center justify-center rounded-lg h-9 text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-700"><ArrowRight className="mr-1.5 h-3 w-3" /> Remind</button>
                <button className={cn("flex flex-1 items-center justify-center rounded-lg h-9 text-xs font-bold transition-all active:scale-95", owesYou ? "bg-teal-500 text-white hover:bg-teal-600 shadow-md shadow-teal-500/20" : "bg-slate-900 text-white hover:bg-slate-800")}><Check className="mr-1.5 h-3 w-3" /> {owesYou ? "Record" : "Pay"}</button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 rounded-2xl bg-teal-50 border border-teal-100 p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-teal-600/70 uppercase tracking-wide">Total Balance</p>
          <p className="text-2xl font-black text-teal-600 tracking-tight">+$158.55</p>
        </div>
        <button className="rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-500/20 hover:bg-teal-600 transition-all active:scale-95">Settle All</button>
      </div>
    </div>
  )
}