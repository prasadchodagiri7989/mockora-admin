import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/client';
import {
  MessageSquare,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  Trash2,
  ExternalLink,
  MessageCircle,
  Eye,
  ChevronDown,
  Send,
  Mail,
} from 'lucide-react';

function InstagramIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const STATUS_COLORS = {
  new: 'bg-rose-100 text-rose-700 border border-rose-200',
  read: 'bg-amber-100 text-amber-700 border border-amber-200',
  replied: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
};

const STATUS_ICONS = {
  new: Clock,
  read: Eye,
  replied: CheckCircle2,
};

export default function ChatMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [newCount, setNewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [sendingReply, setSendingReply] = useState(false);
  const [replyFeedback, setReplyFeedback] = useState('');

  const fetchMessages = useCallback(async () => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get(`/chat/messages?${params}`);
      if (res.data.success) {
        setMessages(res.data.messages || []);
        setNewCount(res.data.newCount || 0);
      }
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchMessages();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMessages();
  };

  const handleStatusChange = async (msgId, newStatus) => {
    try {
      await api.patch(`/chat/messages/${msgId}`, { status: newStatus });
      setMessages(prev => prev.map(m => m._id === msgId ? { ...m, status: newStatus } : m));
      if (selectedMsg?._id === msgId) setSelectedMsg(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedMsg) return;
    try {
      setSavingNote(true);
      await api.patch(`/chat/messages/${selectedMsg._id}`, { adminNote });
      setMessages(prev => prev.map(m => m._id === selectedMsg._id ? { ...m, adminNote } : m));
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedMsg || !replyText.trim()) return;
    try {
      setSendingReply(true);
      setReplyFeedback('');
      const res = await api.post(`/chat/messages/${selectedMsg._id}/reply`, {
        replyText: replyText.trim(),
        sendEmail: Boolean(sendEmail && selectedMsg.senderEmail),
      });

      if (res.data.success) {
        const updated = res.data.message;
        setMessages(prev => prev.map(m => m._id === updated._id ? updated : m));
        setSelectedMsg(updated);
        const emailMsg = res.data.emailSent
          ? ` (Email dispatched to ${selectedMsg.senderEmail})`
          : res.data.emailSimulated
            ? ` (Email simulated for ${selectedMsg.senderEmail})`
            : '';
        setReplyFeedback(`Reply saved and marked as Replied!${emailMsg}`);
      }
    } catch (err) {
      console.error('Failed to send reply:', err);
      setReplyFeedback('Failed to send reply: ' + (err.response?.data?.message || err.message));
    } finally {
      setSendingReply(false);
    }
  };

  const handleDelete = async (msgId) => {
    if (!window.confirm('Delete this message? This cannot be undone.')) return;
    try {
      await api.delete(`/chat/messages/${msgId}`);
      setMessages(prev => prev.filter(m => m._id !== msgId));
      if (selectedMsg?._id === msgId) setSelectedMsg(null);
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const openMessage = async (msg) => {
    setSelectedMsg(msg);
    setAdminNote(msg.adminNote || '');
    setReplyText(msg.adminReply || '');
    setSendEmail(Boolean(msg.senderEmail));
    setReplyFeedback('');
    // Auto-mark as read
    if (msg.status === 'new') {
      await handleStatusChange(msg._id, 'read');
    }
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-500" />
            Chat Messages
            {newCount > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold animate-pulse">
                {newCount} new
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Messages received from visitors via the landing page chat widget
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://www.instagram.com/neuvexa.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold shadow-sm hover:opacity-90 transition"
          >
            <InstagramIcon className="w-3.5 h-3.5" />
            @neuvexa.in
          </a>
          <button
            onClick={fetchMessages}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search messages, names, emails..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition">
            Search
          </button>
        </form>

        <div className="flex gap-2">
          {['all', 'new', 'read', 'replied'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition ${
                statusFilter === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Messages List + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: Messages List */}
        <div className="lg:col-span-2 space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading…
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16 text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No messages found</p>
              <p className="text-xs mt-1">Visitor messages from the chat widget will appear here</p>
            </div>
          ) : (
            messages.map(msg => {
              const StatusIcon = STATUS_ICONS[msg.status] || Clock;
              const isSelected = selectedMsg?._id === msg._id;
              return (
                <div
                  key={msg._id}
                  onClick={() => openMessage(msg)}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    isSelected
                      ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 hover:bg-slate-50'
                  } ${msg.status === 'new' ? 'ring-2 ring-rose-300 ring-offset-1' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {msg.senderName || 'Anonymous'}
                        </p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${STATUS_COLORS[msg.status]}`}>
                          {msg.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {msg.message}
                      </p>
                    </div>
                    <div className="text-[10px] text-slate-400 shrink-0 text-right">
                      {formatDate(msg.createdAt).split(',')[0]}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Detail Panel */}
        <div className="lg:col-span-3">
          {!selectedMsg ? (
            <div className="h-full min-h-[400px] flex items-center justify-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-center">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">Select a message to view details</p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
              {/* Message Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedMsg.senderName || 'Anonymous Visitor'}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[selectedMsg.status]}`}>
                      {selectedMsg.status}
                    </span>
                  </div>
                  {selectedMsg.senderEmail && (
                    <p className="text-xs text-slate-500 mt-0.5">{selectedMsg.senderEmail}</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {formatDate(selectedMsg.createdAt)} • Page: {selectedMsg.page}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(selectedMsg._id)}
                  className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 transition"
                  title="Delete message"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Message Content */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {selectedMsg.message}
                </p>
              </div>

              {/* Status Actions */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Update Status</p>
                <div className="flex gap-2 flex-wrap">
                  {['new', 'read', 'replied'].map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(selectedMsg._id, s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                        selectedMsg.status === s
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reply to Visitor */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950 dark:text-indigo-200">
                      Reply to Visitor
                    </h4>
                  </div>
                  {selectedMsg.senderEmail && (
                    <a
                      href={`mailto:${selectedMsg.senderEmail}?subject=${encodeURIComponent('Reply from MockOra Support')}&body=${encodeURIComponent(`Hi ${selectedMsg.senderName || ''},\n\nIn response to your query:\n"${selectedMsg.message}"\n\n`)}`}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3" />
                      <span>Open in Mail App</span>
                    </a>
                  )}
                </div>

                {selectedMsg.adminReply && (
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200/60 dark:border-indigo-800/40 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Previous Reply Recorded:</span>
                      {selectedMsg.repliedAt && <span>{formatDate(selectedMsg.repliedAt)}</span>}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{selectedMsg.adminReply}</p>
                  </div>
                )}

                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={
                    selectedMsg.senderEmail
                      ? `Write your response to ${selectedMsg.senderName || 'this visitor'} (will be sent to ${selectedMsg.senderEmail})...`
                      : "Visitor didn't provide an email. Write your reply here to save it to records..."
                  }
                  rows={4}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  {selectedMsg.senderEmail ? (
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={sendEmail}
                        onChange={e => setSendEmail(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Dispatch copy to <strong>{selectedMsg.senderEmail}</strong></span>
                    </label>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      (No email provided by visitor)
                    </span>
                  )}

                  <button
                    onClick={handleSendReply}
                    disabled={sendingReply || !replyText.trim()}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs"
                  >
                    <Send className={`w-3.5 h-3.5 ${sendingReply ? 'animate-spin' : ''}`} />
                    <span>{sendingReply ? 'Sending…' : 'Send Reply'}</span>
                  </button>
                </div>

                {replyFeedback && (
                  <p className={`text-xs font-semibold mt-2 ${replyFeedback.startsWith('Failed') ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {replyFeedback}
                  </p>
                )}
              </div>

              {/* Admin Note */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Internal Admin Note</p>
                <textarea
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  placeholder="Add a private internal note about this message..."
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                <button
                  onClick={handleSaveNote}
                  disabled={savingNote}
                  className="mt-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {savingNote ? 'Saving…' : 'Save Internal Note'}
                </button>
              </div>

              {/* Instagram Reply Shortcut */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border border-pink-200 dark:border-pink-800 flex items-center gap-3">
                <InstagramIcon className="w-5 h-5 text-pink-500 shrink-0" />
                <div className="flex-1 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Reply on Instagram: </span>
                  If this visitor is unreachable by email, direct them to contact{' '}
                  <strong>@neuvexa.in</strong>
                </div>
                <a
                  href="https://www.instagram.com/neuvexa.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold hover:opacity-90 transition flex items-center gap-1"
                >
                  Open <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
