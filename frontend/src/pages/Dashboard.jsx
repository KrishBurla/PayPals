// src/pages/Dashboard.jsx
import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { GroupHeader } from '../components/GroupHeader';
import { BalanceCard } from '../components/BalanceCard';
import { ExpenseLedger } from '../components/ExpenseLedger';
import { MemberDebtList } from '../components/MemberDebtList';
import { FloatingActions } from '../components/FloatingActions';

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar />
      <main className="flex-1 lg:ml-72">
        <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
          <GroupHeader />
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <BalanceCard />
              <ExpenseLedger />
            </div>
            <div className="lg:col-span-1">
              <MemberDebtList />
            </div>
          </div>
        </div>
        <FloatingActions />
      </main>
    </div>
  )
}