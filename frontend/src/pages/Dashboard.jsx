import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { GroupHeader } from '../components/GroupHeader';
import { BalanceCard } from '../components/BalanceCard';
import { ExpenseLedger } from '../components/ExpenseLedger';
import { MemberDebtList } from '../components/MemberDebtList';
import { MonthlyChart, CategorySpending, QuickStats, ActivityFeed } from '../components/Analytics';
import { FloatingActions } from '../components/FloatingActions';

export default function Dashboard() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);

  return (
    // THE FIX: Standard block layout. Do NOT use 'flex' here.
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      <Sidebar />
      
      {/* THE MAGIC OFFSET: lg:ml-72 pushes the main content right by exactly 18rem (w-72) on desktop to make room for the fixed sidebar. */}
      <main className="transition-all duration-300 ease-in-out lg:ml-72">
        {/* pt-24 on mobile pushes content down so it doesn't hide behind the hamburger menu. lg:pt-8 restores normal padding. */}
        <div className="mx-auto max-w-[1600px] p-6 pt-24 lg:p-8 lg:pt-8">
          
          <GroupHeader onAddExpense={() => setIsAddOpen(true)} />
          
          <div className="mt-8 grid gap-8 xl:grid-cols-3">
            {/* Left Column */}
            <div className="flex min-w-0 flex-col gap-8 xl:col-span-2">
              <BalanceCard onSettle={() => setIsSettleOpen(true)} />
              <MonthlyChart />
              <ExpenseLedger />
            </div>
            
            {/* Right Column */}
            <div className="flex min-w-0 flex-col gap-8 xl:col-span-1">
              <MemberDebtList onSettle={() => setIsSettleOpen(true)} />
              <CategorySpending />
              <QuickStats />
              <ActivityFeed />
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <FloatingActions 
            onAddExpense={() => setIsAddOpen(true)} 
            onSettle={() => setIsSettleOpen(true)} 
        />
      </main>

      {/* --- ADD EXPENSE MODAL --- */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={() => setIsAddOpen(false)}>
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-extrabold text-slate-900">Add Expense</h2>
                    <button onClick={() => setIsAddOpen(false)} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"><X className="h-5 w-5"/></button>
                </div>
                <div className="space-y-5">
                    <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
                        <input type="text" placeholder="e.g. Dinner at Olive Garden" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-medium text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3.5 font-bold text-slate-400">$</span>
                                <input type="number" placeholder="0.00" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-8 pr-4 font-bold text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" />
                            </div>
                        </div>
                        <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Category</label>
                            <select className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-bold text-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20">
                                <option>🍽️ Food</option>
                                <option>🏠 Housing</option>
                                <option>🚗 Transport</option>
                                <option>📺 Subscriptions</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Paid By</label>
                        <select className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-bold text-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20">
                            <option>You</option>
                            <option>Sarah Chen</option>
                            <option>Mike Wilson</option>
                            <option>Emily Davis</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-500">Split Between</label>
                        <div className="flex flex-wrap gap-2">
                            {["You", "Sarah", "Mike", "Emily"].map(name => (
                                <label key={name} className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 transition-colors hover:border-teal-300 hover:bg-teal-50/50">
                                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 accent-teal-500 text-teal-500 focus:ring-teal-500" />
                                    <span className="text-sm font-bold text-slate-700">{name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <button onClick={() => setIsAddOpen(false)} className="mt-4 w-full rounded-xl bg-teal-500 py-4 text-lg font-bold text-white shadow-lg shadow-teal-500/25 transition-all hover:bg-teal-600 active:scale-95">
                        Add Expense
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- SETTLE UP MODAL --- */}
      {isSettleOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={() => setIsSettleOpen(false)}>
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-extrabold text-slate-900">Settle Up</h2>
                    <button onClick={() => setIsSettleOpen(false)} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"><X className="h-5 w-5"/></button>
                </div>
                <p className="mb-5 text-sm font-medium text-slate-500">Choose who you want to settle with:</p>
                <div className="mb-6 space-y-3">
                    <div className="flex cursor-pointer items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-3.5 transition-colors hover:border-slate-300 hover:bg-slate-100">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-teal-200 bg-teal-100 text-sm font-bold text-teal-700">SC</div>
                        <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">Sarah Chen</p>
                            <p className="truncate text-xs font-semibold text-teal-600">owes you $87.25</p>
                        </div>
                        <button className="rounded-lg border border-teal-200 bg-white px-4 py-2 text-xs font-bold text-teal-700 shadow-sm transition-colors hover:bg-teal-50">Remind</button>
                    </div>
                    <div className="flex cursor-pointer items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-3.5 transition-colors hover:border-slate-300 hover:bg-slate-100">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-rose-200 bg-rose-100 text-sm font-bold text-rose-700">MW</div>
                        <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">Mike Wilson</p>
                            <p className="truncate text-xs font-semibold text-rose-600">you owe $37.08</p>
                        </div>
                        <button className="rounded-lg border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-rose-700 shadow-sm transition-colors hover:bg-rose-50">Pay</button>
                    </div>
                </div>
                <button onClick={() => setIsSettleOpen(false)} className="w-full rounded-xl bg-slate-900 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-slate-800 active:scale-95">
                    Settle All Debts
                </button>
            </div>
        </div>
      )}
    </div>
  )
}