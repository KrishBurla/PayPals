import React from "react"
import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react"

export function BalanceCard() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        <div className="relative p-6 lg:p-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50"><ArrowDownRight className="h-5 w-5 text-teal-500" /></div>
            <span className="text-sm font-semibold text-slate-500">You are owed</span>
          </div>
          <p className="mt-3 text-4xl font-extrabold tracking-tight text-teal-500">$245.80</p>
          <p className="mt-1 text-xs font-medium text-slate-400">From 3 people</p>
        </div>

        <div className="relative p-6 lg:p-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50"><ArrowUpRight className="h-5 w-5 text-rose-500" /></div>
            <span className="text-sm font-semibold text-slate-500">You owe</span>
          </div>
          <p className="mt-3 text-4xl font-extrabold tracking-tight text-rose-500">$87.25</p>
          <p className="mt-1 text-xs font-medium text-slate-400">To 2 people</p>
        </div>

        <div className="relative p-6 lg:p-8 bg-slate-50/50 flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200"><Wallet className="h-5 w-5 text-slate-700" /></div>
            <span className="text-sm font-semibold text-slate-500">Net Balance</span>
          </div>
          <p className="mt-3 text-4xl font-extrabold tracking-tight text-teal-500">+$158.55</p>
          <button className="mt-5 w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white shadow-md hover:bg-slate-800 active:scale-95 transition-all">
            Settle Up
          </button>
        </div>
      </div>
    </div>
  )
}