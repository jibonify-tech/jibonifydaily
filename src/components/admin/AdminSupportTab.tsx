import React, { useState } from 'react';
import {
  LifeBuoy,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  User,
  Cpu,
  Smartphone,
  Tag,
  Check,
  Search,
} from 'lucide-react';
import { AdminUser, SupportTicket } from '../../types';
import { adminDb } from '../../services/adminStorage';
import { db } from '../../services/storage';

interface AdminSupportTabProps {
  admin: AdminUser;
  language: 'bn' | 'en';
  onRefresh: () => void;
}

export const AdminSupportTab: React.FC<AdminSupportTabProps> = ({
  admin,
  language,
  onRefresh,
}) => {
  const [tickets, setTickets] = useState<SupportTicket[]>(adminDb.getSupportTickets());
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(tickets[0] || null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const refreshList = () => {
    const list = adminDb.getSupportTickets();
    setTickets(list);
    if (selectedTicket) {
      const updated = list.find((t) => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    }
    onRefresh();
  };

  const showToast = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 3000);
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      !search ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.userName.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleStatusChange = (newStatus: SupportTicket['status']) => {
    if (!selectedTicket) return;
    const updated: SupportTicket = {
      ...selectedTicket,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    const list = tickets.map((t) => (t.id === selectedTicket.id ? updated : t));
    adminDb.saveSupportTickets(list);
    db.addAuditLog(
      'SUPPORT_TICKET_STATUS',
      'system',
      `Admin ${admin.name} updated ticket ${selectedTicket.ticketNumber} status to ${newStatus}.`,
      admin.name
    );
    setSelectedTicket(updated);
    refreshList();
    showToast(`Ticket status updated to ${newStatus}`);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    const newReply = {
      id: `rep_${Date.now()}`,
      author: admin.name,
      isStaff: true,
      text: replyText.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated: SupportTicket = {
      ...selectedTicket,
      status: selectedTicket.status === 'open' ? 'in_progress' : selectedTicket.status,
      updatedAt: new Date().toISOString(),
      replies: [...(selectedTicket.replies || []), newReply],
    };

    const list = tickets.map((t) => (t.id === selectedTicket.id ? updated : t));
    adminDb.saveSupportTickets(list);
    db.addAuditLog(
      'SUPPORT_REPLY_SENT',
      'system',
      `Admin ${admin.name} replied to ticket ${selectedTicket.ticketNumber}.`,
      admin.name
    );
    setReplyText('');
    setSelectedTicket(updated);
    refreshList();
    showToast('Reply dispatched to user');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNote.trim() || !selectedTicket) return;

    const newNoteObj = {
      id: `in_${Date.now()}`,
      author: admin.name,
      text: internalNote.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated: SupportTicket = {
      ...selectedTicket,
      updatedAt: new Date().toISOString(),
      internalNotes: [...(selectedTicket.internalNotes || []), newNoteObj],
    };

    const list = tickets.map((t) => (t.id === selectedTicket.id ? updated : t));
    adminDb.saveSupportTickets(list);
    setInternalNote('');
    setSelectedTicket(updated);
    refreshList();
    showToast('Internal note saved');
  };

  return (
    <div className="space-y-4">
      {statusNotice && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-950/90 border border-emerald-500/50 p-2.5 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Ticket Management Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Tickets List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ticket subject, user, #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 rounded-xl bg-slate-800 border border-slate-700 px-2 py-1.5 text-xs text-white focus:outline-hidden"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting">Waiting</option>
                <option value="resolved">Resolved</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="flex-1 rounded-xl bg-slate-800 border border-slate-700 px-2 py-1.5 text-xs text-white focus:outline-hidden"
              >
                <option value="all">All Priority</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredTickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/60 shadow-md'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400">{t.ticketNumber}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        t.priority === 'critical'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          : t.priority === 'high'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white line-clamp-1">{t.subject}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{t.userName} · {t.userEmail}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-800/60">
                    <span className="capitalize text-indigo-400">{t.category}</span>
                    <span className="font-num">{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Ticket Detail & Responses */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-400">{selectedTicket.ticketNumber}</span>
                    <span className="text-xs text-slate-400 font-semibold capitalize">({selectedTicket.category})</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">{selectedTicket.subject}</h3>
                  <p className="text-xs text-slate-400">
                    From: <strong className="text-slate-200">{selectedTicket.userName}</strong> ({selectedTicket.userEmail})
                  </p>
                </div>

                {/* Status Switcher */}
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleStatusChange(e.target.value as any)}
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-bold text-white focus:outline-hidden"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting">Waiting for User</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Safe Diagnostic Info (NO private financial data) */}
              {selectedTicket.diagnosticInfo && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-300">
                    <Cpu className="w-3.5 h-3.5 text-blue-400" />
                    <span>Safe Diagnostic Environment</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                    <div>App Version: <strong className="text-white">v{selectedTicket.diagnosticInfo.appVersion}</strong></div>
                    <div>OS: <strong className="text-white">{selectedTicket.diagnosticInfo.os}</strong></div>
                    <div>Device: <strong className="text-white">{selectedTicket.diagnosticInfo.deviceType}</strong></div>
                    <div>Network: <strong className="text-white">{selectedTicket.diagnosticInfo.network}</strong></div>
                  </div>
                </div>
              )}

              {/* Ticket Original Description */}
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">User Ingestion Message:</p>
                {selectedTicket.description}
              </div>

              {/* Conversation / Reply Thread */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Public Communication Thread</span>
                </h4>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedTicket.replies && selectedTicket.replies.length > 0 ? (
                    selectedTicket.replies.map((r) => (
                      <div
                        key={r.id}
                        className={`p-3 rounded-xl text-xs space-y-1 ${
                          r.isStaff
                            ? 'bg-indigo-950/50 border border-indigo-500/30 ml-4'
                            : 'bg-slate-800 border border-slate-700 mr-4'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className={`font-bold ${r.isStaff ? 'text-indigo-300' : 'text-slate-300'}`}>
                            {r.author} {r.isStaff && '(Staff Support)'}
                          </span>
                          <span className="text-slate-500 font-num">{new Date(r.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-200 text-xs">{r.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No replies posted yet.</p>
                  )}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    required
                    placeholder="Type official reply to user..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>

              {/* Internal Notes */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-300 uppercase">Internal Staff Notes (Hidden from User)</span>
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add private staff observation..."
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    className="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs text-white focus:outline-hidden"
                  />
                  <button type="submit" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg">
                    Add Note
                  </button>
                </form>
                {selectedTicket.internalNotes && selectedTicket.internalNotes.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {selectedTicket.internalNotes.map((n) => (
                      <p key={n.id} className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded border border-slate-800">
                        <strong className="text-slate-200">{n.author}:</strong> {n.text}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">
              Select a support ticket from the list to view diagnostic logs and reply.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
