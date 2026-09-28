import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Clock,
  Phone,
  MapPin,
  CheckCircle2,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Account, DebtRecord, Language, Person, Transaction } from '../../types';
import { formatCurrency, translations } from '../../i18n/translations';

interface PeopleViewProps {
  people: Person[];
  debts: DebtRecord[];
  accounts: Account[];
  onAddPerson: (person: Omit<Person, 'id' | 'createdAt' | 'totalLent' | 'totalBorrowed'>) => void;
  onAddDebt: (debt: Omit<DebtRecord, 'id' | 'paidAmount' | 'remainingAmount' | 'isFullyPaid' | 'repayments' | 'createdAt'>, accountId: string) => void;
  onAddRepayment: (debtId: string, amount: number, accountId: string, note?: string) => void;
  language: Language;
}

export const PeopleView: React.FC<PeopleViewProps> = ({
  people,
  debts,
  accounts,
  onAddPerson,
  onAddDebt,
  onAddRepayment,
  language,
}) => {
  const t = translations[language];

  const [showAddPersonModal, setShowAddPersonModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [showRepaymentModal, setShowRepaymentModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<DebtRecord | null>(null);

  // Add person form
  const [personName, setPersonName] = useState('');
  const [personPhone, setPersonPhone] = useState('');
  const [personAddress, setPersonAddress] = useState('');
  const [personNotes, setPersonNotes] = useState('');

  // Add debt form
  const [debtPersonId, setDebtPersonId] = useState(people[0]?.id || '');
  const [debtType, setDebtType] = useState<'lend' | 'borrow'>('lend');
  const [debtAmount, setDebtAmount] = useState('');
  const [debtReason, setDebtReason] = useState('');
  const [debtDueDate, setDebtDueDate] = useState('');
  const [debtAccountId, setDebtAccountId] = useState(accounts[0]?.id || '');

  // Repayment form
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [repaymentAccountId, setRepaymentAccountId] = useState(accounts[0]?.id || '');
  const [repaymentNote, setRepaymentNote] = useState('');

  // Calculations
  const totalReceivable = debts
    .filter((d) => d.type === 'lend' && !d.isFullyPaid)
    .reduce((sum, d) => sum + d.remainingAmount, 0);

  const totalPayable = debts
    .filter((d) => d.type === 'borrow' && !d.isFullyPaid)
    .reduce((sum, d) => sum + d.remainingAmount, 0);

  const netLendingPosition = totalReceivable - totalPayable;

  const peopleMap = Object.fromEntries(people.map((p) => [p.id, p]));

  const handleAddPersonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim()) return;
    onAddPerson({
      name: personName.trim(),
      phone: personPhone.trim() || undefined,
      address: personAddress.trim() || undefined,
      notes: personNotes.trim() || undefined,
    });
    setPersonName('');
    setPersonPhone('');
    setPersonAddress('');
    setPersonNotes('');
    setShowAddPersonModal(false);
  };

  const handleDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(debtAmount);
    if (!amt || amt <= 0 || !debtPersonId) return;

    onAddDebt(
      {
        personId: debtPersonId,
        type: debtType,
        amount: amt,
        date: new Date().toISOString().split('T')[0],
        dueDate: debtDueDate || undefined,
        reason: debtReason.trim() || undefined,
      },
      debtAccountId
    );

    setDebtAmount('');
    setDebtReason('');
    setDebtDueDate('');
    setShowDebtModal(false);
  };

  const handleRepaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebt) return;
    const amt = parseFloat(repaymentAmount);
    if (!amt || amt <= 0) return;

    onAddRepayment(selectedDebt.id, amt, repaymentAccountId, repaymentNote);
    setRepaymentAmount('');
    setRepaymentNote('');
    setSelectedDebt(null);
    setShowRepaymentModal(false);
  };

  return (
    <div className="space-y-5 pb-16 lg:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span>{t.peopleLending}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'bn' ? 'কাকে কত টাকা ধার দিয়েছেন বা কার থেকে ধার নিয়েছেন তার নির্ভুল খতিয়ান' : 'Track money lent, borrowed and partial/full repayments'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddPersonModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 text-xs font-medium transition"
          >
            <UserPlus className="w-3.5 h-3.5 text-purple-400" />
            <span>{language === 'bn' ? '+ নতুন ব্যক্তি' : '+ Add Person'}</span>
          </button>
          <button
            onClick={() => {
              setDebtType('lend');
              setShowDebtModal(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 text-xs font-semibold shadow-xs transition active:scale-95"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{t.giveMoneyTo}</span>
          </button>
          <button
            onClick={() => {
              setDebtType('borrow');
              setShowDebtModal(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white px-3 py-2 text-xs font-semibold shadow-xs transition active:scale-95"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>{t.borrowMoneyFrom}</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-purple-500/30 bg-purple-950/30 p-4 shadow-xs">
          <span className="text-xs font-medium text-purple-300">{t.iWillReceive}</span>
          <p className="text-2xl font-black text-purple-400 font-num mt-1">
            {formatCurrency(totalReceivable, language)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {language === 'bn' ? 'অন্যদের কাছে আপনার পাওনা টাকা' : 'Money others owe you'}
          </span>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/30 p-4 shadow-xs">
          <span className="text-xs font-medium text-amber-300">{t.iHaveToPay}</span>
          <p className="text-2xl font-black text-amber-400 font-num mt-1">
            {formatCurrency(totalPayable, language)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {language === 'bn' ? 'অন্যদের আপনাকে দিতে হবে (দেনা)' : 'Money you have to pay'}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-300">{t.netLendingPosition}</span>
          <p
            className={`text-2xl font-black font-num mt-1 ${
              netLendingPosition >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatCurrency(netLendingPosition, language)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {netLendingPosition >= 0
              ? language === 'bn'
                ? 'সামগ্রিক ভাবে আপনি উদ্বৃত্তে আছেন'
                : 'Overall positive credit'
              : language === 'bn'
              ? 'সামগ্রিক ভাবে আপনার দেনা বেশি'
              : 'Overall debt higher'}
          </span>
        </div>
      </div>

      {/* Active Debts & Receivables List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          {language === 'bn' ? 'বর্তমান দেনা-পাওনার হিসাবসমূহ' : 'Active Lend & Borrow Records'}
        </h3>

        {debts.length === 0 ? (
          <div className="py-8 text-center rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-slate-400 text-xs">
            <Users className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
            <p className="text-sm font-semibold text-slate-300 mb-1">
              {language === 'bn' ? 'কোনো দেনা বা পাওনার রেকর্ড নেই' : 'No lending or borrowing records'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {debts.map((d) => {
              const person = peopleMap[d.personId];
              const isLend = d.type === 'lend';

              return (
                <div
                  key={d.id}
                  className={`rounded-2xl border p-4 shadow-xs transition ${
                    d.isFullyPaid
                      ? 'border-slate-800 bg-slate-900/40 opacity-70'
                      : isLend
                      ? 'border-purple-500/40 bg-slate-900/80'
                      : 'border-amber-500/40 bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isLend ? 'bg-purple-950 text-purple-400' : 'bg-amber-950 text-amber-400'
                        }`}
                      >
                        {isLend ? 'পাওনা' : 'দেনা'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{person?.name || 'Unknown'}</p>
                        {person?.phone && <span className="text-[10px] text-slate-400 font-num">{person.phone}</span>}
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold font-num ${
                        isLend ? 'text-purple-400' : 'text-amber-400'
                      }`}
                    >
                      {formatCurrency(d.amount, language)}
                    </span>
                  </div>

                  <div className="mt-2.5 space-y-1.5 text-xs text-slate-300">
                    {d.reason && (
                      <p className="text-[11px] text-slate-400">
                        {language === 'bn' ? 'কারণ:' : 'Reason:'} <span className="text-slate-200">{d.reason}</span>
                      </p>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{language === 'bn' ? 'তারিখ:' : 'Date:'} <strong className="text-slate-300 font-num">{d.date}</strong></span>
                      {d.dueDate && (
                        <span>{language === 'bn' ? 'শেষ তারিখ:' : 'Due:'} <strong className="text-amber-400 font-num">{d.dueDate}</strong></span>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-1 font-semibold">
                      <span className="text-slate-400">{t.remainingDue}:</span>
                      <span className={`font-num text-sm ${d.isFullyPaid ? 'text-emerald-400' : isLend ? 'text-purple-400' : 'text-amber-400'}`}>
                        {d.isFullyPaid ? (language === 'bn' ? '✅ সম্পূর্ণ পরিশোধিত' : '✅ Paid') : formatCurrency(d.remainingAmount, language)}
                      </span>
                    </div>
                  </div>

                  {/* Repayments log */}
                  {d.repayments.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-0.5">
                      <span className="font-semibold text-slate-300">
                        {language === 'bn' ? 'পরিশোধের ইতিহাস:' : 'Repayments:'}
                      </span>
                      {d.repayments.map((r) => (
                        <div key={r.id} className="flex items-center justify-between text-emerald-400/90 font-num">
                          <span>{r.date} • {r.note || 'ফেরত'}</span>
                          <span>+{formatCurrency(r.amount, language)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {!d.isFullyPaid && (
                    <button
                      onClick={() => {
                        setSelectedDebt(d);
                        setRepaymentAmount(d.remainingAmount.toString());
                        setShowRepaymentModal(true);
                      }}
                      className="mt-3 w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-1.5 text-xs font-semibold text-slate-200 hover:text-white transition flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t.repay}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Person Modal */}
      {showAddPersonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 shadow-2xl text-slate-100 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {language === 'bn' ? 'নতুন ব্যক্তি বা পরিচিতজন যোগ করুন' : 'Add New Contact'}
              </h3>
              <button onClick={() => setShowAddPersonModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPersonSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{language === 'bn' ? 'নাম' : 'Name'}</label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'যেমন: রহিম উল্লাহ, করিম ভাই' : 'e.g. Rahim Ullah'}
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  required
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{language === 'bn' ? 'মোবাইল নম্বর' : 'Phone'}</label>
                <input
                  type="text"
                  placeholder="01XXXXXXXXX"
                  value={personPhone}
                  onChange={(e) => setPersonPhone(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs font-num text-white focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{language === 'bn' ? 'ঠিকানা (ঐচ্ছিক)' : 'Address'}</label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'ধানমন্ডি, ঢাকা' : 'Dhaka, Bangladesh'}
                  value={personAddress}
                  onChange={(e) => setPersonAddress(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{t.notes}</label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'অফিস কলিগ, বন্ধু ইত্যাদি' : 'Notes'}
                  value={personNotes}
                  onChange={(e) => setPersonNotes(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddPersonModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-bold text-white shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>{t.save}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Debt / Lend Modal */}
      {showDebtModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 shadow-2xl text-slate-100 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {debtType === 'lend' ? t.giveMoneyTo : t.borrowMoneyFrom}
              </h3>
              <button onClick={() => setShowDebtModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDebtSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{t.people}</label>
                <select
                  value={debtPersonId}
                  onChange={(e) => setDebtPersonId(e.target.value)}
                  required
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500"
                >
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.phone ? `(${p.phone})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{t.amount} (BDT)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-num">৳</span>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={debtAmount}
                    onChange={(e) => setDebtAmount(e.target.value)}
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 pl-8 pr-3 py-2 text-lg font-bold font-num text-white focus:outline-hidden focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{t.account}</label>
                <select
                  value={debtAccountId}
                  onChange={(e) => setDebtAccountId(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatCurrency(a.balance, language)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{language === 'bn' ? 'কারণ' : 'Reason'}</label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'যেমন: জরুরি দরকার, চিকিৎসা ধার' : 'Reason'}
                  value={debtReason}
                  onChange={(e) => setDebtReason(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{t.dueDate}</label>
                <input
                  type="date"
                  value={debtDueDate}
                  onChange={(e) => setDebtDueDate(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDebtModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-bold text-white shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>{t.save}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Repayment Modal */}
      {showRepaymentModal && selectedDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 shadow-2xl text-slate-100 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {t.repay} ({peopleMap[selectedDebt.personId]?.name})
              </h3>
              <button onClick={() => setShowRepaymentModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRepaymentSubmit} className="mt-4 space-y-3">
              <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800 text-xs flex justify-between">
                <span className="text-slate-400">{t.remainingDue}:</span>
                <span className="font-bold text-emerald-400 font-num">
                  {formatCurrency(selectedDebt.remainingAmount, language)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{language === 'bn' ? 'ফেরতের পরিমাণ (BDT)' : 'Repayment Amount'}</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-num">৳</span>
                  <input
                    type="number"
                    step="any"
                    max={selectedDebt.remainingAmount}
                    value={repaymentAmount}
                    onChange={(e) => setRepaymentAmount(e.target.value)}
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 pl-8 pr-3 py-2 text-lg font-bold font-num text-emerald-400 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{t.account}</label>
                <select
                  value={repaymentAccountId}
                  onChange={(e) => setRepaymentAccountId(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatCurrency(a.balance, language)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">{t.notes}</label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'আংশিক বা সম্পূর্ণ ফেরত' : 'Notes'}
                  value={repaymentNote}
                  onChange={(e) => setRepaymentNote(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRepaymentModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>{language === 'bn' ? 'ফেরত নিশ্চিত করুন' : 'Confirm Repayment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
