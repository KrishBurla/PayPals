import { useCurrency } from '../context/CurrencyContext';
import React, { useState } from "react"
import { ArrowRight, Check, Bell, Send, ChevronDown, ChevronUp, Receipt } from "lucide-react"
import { cn } from "../lib/utils"

export function MemberDebtList({ balances = {}, users = [], currentUser, onSettle, onRemind, expenses = [] }) {
  const { formatCurrency } = useCurrency();
  const [remindingId, setRemindingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  
  const netBalances = {};
  let totalNet = 0;
  
  // Aggregate all balances into a net amount per user and retain raw records
  Object.keys(balances).forEach(key => {
      const [whoOwes, whoIsOwed] = key.split(' -> ');
      const amount = balances[key];
      if (amount <= 0) return;
      
      let otherUserId, multiplier, labelText;
      if (whoOwes === currentUser.id) {
          otherUserId = whoIsOwed;
          multiplier = -1; // You owe them
          labelText = "You owe";
      } else if (whoIsOwed === currentUser.id) {
          otherUserId = whoOwes;
          multiplier = 1; // They owe you
          labelText = "They owe you";
      } else {
          return;
      }
      
      if (!netBalances[otherUserId]) netBalances[otherUserId] = { net: 0, raw: [] };
      netBalances[otherUserId].net += (amount * multiplier);
      netBalances[otherUserId].raw.push({ label: labelText, amount, isNegative: multiplier === -1 });
  });

  const memberDebts = [];
  
  Object.keys(netBalances).forEach(otherUserId => {
      const { net, raw } = netBalances[otherUserId];
      if (Math.abs(net) < 0.01) return; // Completely settled
      
      totalNet += net;
      const direction = net > 0 ? "owes_you" : "you_owe";
      
      const otherUser = users.find(u => u.id === otherUserId);
      const name = otherUser?.name || "Unknown";
      const initials = name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();

      // Find expenses that link these two users together
      const sharedExpenses = expenses.filter(ex => 
          (ex.paidBy === currentUser.id && ex.participants?.some(p => p.userId === otherUserId)) ||
          (ex.paidBy === otherUserId && ex.participants?.some(p => p.userId === currentUser.id))
      );
      
      memberDebts.push({
          id: otherUserId,
          name,
          initials,
          color: direction === "owes_you" ? "bg-teal-100 text-teal-700 border-teal-200" : "bg-rose-100 text-rose-700 border-rose-200",
          amount: Math.abs(net),
          direction,
          raw,
          sharedExpenses
      });
  });

  const handleRemind = async (debt) => {
      setRemindingId(debt.id);
      if (onRemind) await onRemind(debt.id, debt.name, debt.amount);
      setTimeout(() => setRemindingId(null), 2000);
  };
  
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Member Net Balances</h3>
      </div>
      
      <div className="space-y-4">
        {memberDebts.map((debt) => {
          const owesYou = debt.direction === "owes_you"
          const isReminding = remindingId === debt.id;
          const isExpanded = expandedId === debt.id;
          
          return (
            <div key={debt.id} className="group overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50 transition-all hover:bg-slate-50 hover:border-slate-200 hover:shadow-sm">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold border shadow-sm ${debt.color}`}>{debt.initials}</div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{debt.name}</p>
                      <p className={cn("text-xs font-semibold mt-0.5", owesYou ? "text-teal-600" : "text-rose-600")}>{owesYou ? "owes you net" : "you owe net"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                      <p className={cn("text-xl font-black", owesYou ? "text-teal-600" : "text-rose-600")}>{formatCurrency(debt.amount)}</p>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <button 
                      onClick={() => setExpandedId(isExpanded ? null : debt.id)} 
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg h-9 text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-all"
                  >
                      Breakdown {isExpanded ? <ChevronUp className="h-3 w-3"/> : <ChevronDown className="h-3 w-3"/>}
                  </button>
                  {owesYou && (
                    <button 
                      onClick={() => handleRemind(debt)} 
                      disabled={isReminding}
                      className={cn(
                        "flex flex-1 items-center justify-center rounded-lg h-9 text-xs font-bold border transition-all",
                        isReminding 
                          ? "border-teal-200 bg-teal-50 text-teal-600" 
                          : "border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 text-slate-700"
                      )}
                    >
                      {isReminding ? <><Check className="mr-1.5 h-3 w-3" /> Sent!</> : <><Bell className="mr-1.5 h-3 w-3" /> Remind</>}
                    </button>
                  )}
                  <button onClick={onSettle} className={cn("flex flex-1 items-center justify-center rounded-lg h-9 text-xs font-bold transition-all active:scale-95", owesYou ? "bg-teal-500 text-white hover:bg-teal-600 shadow-md shadow-teal-500/20" : "bg-slate-900 text-white hover:bg-slate-800")}><Check className="mr-1.5 h-3 w-3" /> {owesYou ? "Record" : "Pay"}</button>
                </div>
              </div>
              
              {/* Expandable Breakdown List */}
              {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-100/50 p-4 space-y-4">
                      
                      {/* Sub-Balance Math */}
                      {debt.raw.length > 1 && (
                          <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Math Calculation</p>
                              <div className="bg-white rounded-lg border border-slate-200 p-3 space-y-1">
                                  {debt.raw.map((r, i) => (
                                      <div key={i} className="flex justify-between items-center text-xs">
                                          <span className="font-semibold text-slate-600">{r.label}</span>
                                          <span className={`font-bold ${r.isNegative ? 'text-rose-600' : 'text-teal-600'}`}>
                                              {r.isNegative ? '-' : '+'}{formatCurrency(r.amount)}
                                          </span>
                                      </div>
                                  ))}
                                  <div className="pt-2 mt-2 border-t border-slate-100 flex justify-between items-center text-xs font-black">
                                      <span>Net Total</span>
                                      <span className={owesYou ? 'text-teal-600' : 'text-rose-600'}>{formatCurrency(debt.amount)}</span>
                                  </div>
                              </div>
                          </div>
                      )}

                      {/* Associated Expenses */}
                      {debt.sharedExpenses.length > 0 && (
                          <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Involved In Expenses</p>
                              <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                                  {debt.sharedExpenses.map(ex => (
                                      <div key={ex._id} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                                          <div className="flex flex-col">
                                              <span className="text-xs font-bold text-slate-800">{ex.description}</span>
                                              <span className="text-[10px] font-medium text-slate-400">Ledger item cost: {formatCurrency(ex.amount)}</span>
                                          </div>
                                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                              {ex.paidBy === currentUser.id ? "You paid" : "They paid"}
                                          </span>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
              )}
            </div>
          )
        })}
        {memberDebts.length === 0 && (
          <div className="text-center py-8 text-sm text-slate-400 font-medium">All settled up! 🎉</div>
        )}
      </div>
      <div className="mt-6 rounded-2xl bg-teal-50 border border-teal-100 p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-teal-600/70 uppercase tracking-wide">Total Sub-Balance</p>
          <p className={`text-2xl font-black ${totalNet >= 0 ? 'text-teal-600' : 'text-rose-600'} tracking-tight`}>{`${totalNet >= 0 ? '+' : '-'}${formatCurrency(Math.abs(totalNet)).substring(1)}`}</p>
        </div>
        <button onClick={onSettle} className="rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-500/20 hover:bg-teal-600 transition-all active:scale-95">Settle All</button>
      </div>
    </div>
  )
}