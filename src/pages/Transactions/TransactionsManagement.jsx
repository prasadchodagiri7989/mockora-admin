import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import Modal from '../../components/Modal';
import { 
  Receipt, 
  Search, 
  Filter, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Copy, 
  Check, 
  Eye, 
  Download, 
  RefreshCw, 
  User, 
  CreditCard, 
  Sparkles, 
  ShieldCheck,
  Calendar,
  Phone,
  Mail,
  Tag
} from 'lucide-react';

export default function TransactionsManagement() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    paidCount: 0,
    createdCount: 0,
    failedCount: 0,
    averageOrderValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fetchTransactions = async () => {
    try {
      setRefreshing(true);
      const query = new URLSearchParams();
      if (statusFilter !== 'all') query.append('status', statusFilter);
      if (search.trim()) query.append('search', search.trim());

      const res = await api.get(`/payments/transactions?${query.toString()}`);
      if (res.data.success) {
        setOrders(res.data.orders || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  const handleCopy = (text, idKey) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(idKey);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Success</span>
          </span>
        );
      case 'failed':
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3 h-3 text-rose-500" />
            <span>{status === 'expired' ? 'Expired' : 'Failed'}</span>
          </span>
        );
      case 'created':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3 text-amber-500" />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Transactions & Order Ledger</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time tracking of candidate enrollments, gateway transaction IDs, and revenue collection.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchTransactions}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition shadow-2xs"
            title="Refresh Transactions"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden group hover:border-indigo-500/50 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Revenue
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                ₹{stats.totalRevenue.toLocaleString('en-IN')}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
            <span>₹999 All-Exam Pass Volume</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden group hover:border-emerald-500/50 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Successful Orders
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {stats.paidCount}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400">
            Account & credentials provisioned
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden group hover:border-amber-500/50 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Pending Checkout
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {stats.createdCount}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400">
            Orders created / in gateway session
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden group hover:border-indigo-500/50 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Avg. Order Value
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                ₹{stats.averageOrderValue}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400">
            Net average per successful student
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, Txn ID, Order ID..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            {['all', 'paid', 'created', 'failed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg capitalize transition ${
                  statusFilter === st
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {st === 'paid' ? 'Successful' : st === 'created' ? 'Pending' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            <span>Loading transaction ledger...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400 space-y-1">
            <Receipt className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="font-bold text-slate-600 dark:text-slate-400">No transactions recorded</p>
            <p className="text-[11px]">When candidates register and pay via Cashfree, orders and transaction IDs appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 font-bold">Transaction / Order ID</th>
                  <th className="py-3.5 px-4 font-bold">Candidate Details</th>
                  <th className="py-3.5 px-4 font-bold">Exam Stream</th>
                  <th className="py-3.5 px-4 font-bold">Amount Paid</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold">Method</th>
                  <th className="py-3.5 px-4 font-bold">Date & Time</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {orders.map((ord) => {
                  const txnId = ord.transactionId || ord.cfPaymentId || ord.cashfreeOrderId;
                  return (
                    <tr 
                      key={ord._id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition group"
                    >
                      {/* Transaction ID & Order ID */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                              {txnId}
                            </span>
                            <button
                              onClick={() => handleCopy(txnId, `txn_${ord._id}`)}
                              className="text-slate-400 hover:text-indigo-600 transition"
                              title="Copy Transaction ID"
                            >
                              {copiedId === `txn_${ord._id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                            <span>Ref: {ord.cashfreeOrderId}</span>
                          </div>
                        </div>
                      </td>

                      {/* Candidate */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {ord.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                            {ord.email}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {ord.mobile}
                          </p>
                        </div>
                      </td>

                      {/* Exam Category */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] border border-indigo-200 dark:border-indigo-800">
                          {ord.category}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-black text-slate-900 dark:text-white text-sm">
                            ₹{ord.amount}
                          </span>
                          {ord.couponCode && (
                            <span className="block text-[10px] text-emerald-600 font-semibold">
                              Coupon: {ord.couponCode}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(ord.status)}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">
                          {ord.paymentMethod || 'Online Gateway'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-slate-500">
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                        <span className="block text-[10px] text-slate-400">
                          {new Date(ord.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 font-semibold transition flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Audit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Audit & Receipt Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title="Transaction & Order Audit Receipt"
          subtitle={`Verified record for order reference ${selectedOrder.cashfreeOrderId}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-5 text-xs">
            {/* Payment Status Banner */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              selectedOrder.status === 'paid'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                : selectedOrder.status === 'failed'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                  selectedOrder.status === 'paid' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-white'
                }`}>
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                    ₹{selectedOrder.amount} INR
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Payment Status: <strong className="uppercase">{selectedOrder.status}</strong>
                  </span>
                </div>
              </div>
              {getStatusBadge(selectedOrder.status)}
            </div>

            {/* Candidate Info Grid */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                <span>Candidate Profile</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Full Name:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedOrder.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Target Stream:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedOrder.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Registered Email:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedOrder.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Mobile Contact:</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{selectedOrder.mobile}</span>
                </div>
              </div>
            </div>

            {/* Gateway & Transaction Identifiers */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Gateway & Transaction Parameters</span>
              </div>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-500 font-sans">Transaction ID:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedOrder.transactionId || selectedOrder.cfPaymentId || 'CF_TXN_' + selectedOrder.cashfreeOrderId}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-500 font-sans">Cashfree Order ID:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedOrder.cashfreeOrderId}</span>
                </div>
                {selectedOrder.bankReference && (
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500 font-sans">Bank Reference No:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedOrder.bankReference}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-500 font-sans">Payment Channel:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-sans">{selectedOrder.paymentMethod || 'Online Gateway'}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-sans">Created Timestamp:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-sans">{new Date(selectedOrder.createdAt).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Account Provisioning Status */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-slate-700 dark:text-slate-300 font-semibold">
                  Credentials Dispatched via Nodemailer:
                </span>
              </div>
              <span className={`font-bold ${selectedOrder.credentialsSent ? 'text-emerald-600' : 'text-slate-400'}`}>
                {selectedOrder.credentialsSent ? 'Dispatched' : selectedOrder.status === 'paid' ? 'Pending Queue' : 'Not Applicable'}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold transition"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
