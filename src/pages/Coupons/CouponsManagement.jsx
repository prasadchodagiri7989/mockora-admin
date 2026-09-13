import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import Modal from '../../components/Modal';
import { 
  Tag, 
  Plus, 
  Edit2, 
  Trash2, 
  Copy, 
  Check, 
  Calendar, 
  Users, 
  TrendingUp, 
  Search, 
  AlertCircle,
  Sparkles,
  Percent,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw
} from 'lucide-react';

export default function CouponsManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('flat');
  const [discountValue, setDiscountValue] = useState(400);
  const [expiryDate, setExpiryDate] = useState('2026-10-18');
  const [usageLimit, setUsageLimit] = useState(1000);
  const [active, setActive] = useState(true);

  const [copiedCode, setCopiedCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/coupons');
      if (res.data.success) {
        setCoupons(res.data.coupons);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setCode('');
    setDiscountType('flat');
    setDiscountValue(400);
    setExpiryDate('2026-10-18');
    setUsageLimit(1000);
    setActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDiscountType(c.discountType || 'flat');
    setDiscountValue(c.discountValue);
    setExpiryDate(c.expiryDate ? new Date(c.expiryDate).toISOString().split('T')[0] : '');
    setUsageLimit(c.usageLimit || 1000);
    setActive(c.active !== false);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleGenerateCode = () => {
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const val = discountValue ? `${discountValue}` : '300';
    setCode(`MOCK${val}_${randomChars}`);
  };

  const handleCopy = (couponCode) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const handleToggleStatus = async (coupon) => {
    try {
      const res = await api.patch(`/coupons/${coupon._id}/toggle`);
      if (res.data.success) {
        setCoupons(coupons.map(c => c._id === coupon._id ? res.data.coupon : c));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Delete coupon code "${coupon.code}"? This will permanently remove it.`)) return;

    try {
      const res = await api.delete(`/coupons/${coupon._id}`);
      if (res.data.success) {
        setCoupons(coupons.filter(c => c._id !== coupon._id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!code || !code.trim()) {
      setFormError('Coupon code is required.');
      return;
    }
    if (!discountValue || Number(discountValue) <= 0) {
      setFormError('Please enter a valid discount amount.');
      return;
    }

    setSaving(true);

    const payload = {
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
      usageLimit: Number(usageLimit) || 1000,
      active,
    };

    try {
      if (editingCoupon) {
        const res = await api.put(`/coupons/${editingCoupon._id}`, payload);
        if (res.data.success) {
          setCoupons(coupons.map(c => c._id === editingCoupon._id ? res.data.coupon : c));
          setIsModalOpen(false);
        }
      } else {
        const res = await api.post('/coupons', payload);
        if (res.data.success) {
          setCoupons([res.data.coupon, ...coupons]);
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save coupon.');
    } finally {
      setSaving(false);
    }
  };

  // Stats calculation
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => {
    const isExpired = c.expiryDate && new Date() > new Date(c.expiryDate);
    return c.active && !isExpired;
  }).length;
  const totalUsed = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
  const maxDiscount = coupons.length > 0 
    ? Math.max(...coupons.map(c => c.discountType === 'flat' ? c.discountValue : 0)) 
    : 0;

  // Filtered coupons
  const filteredCoupons = coupons.filter(c => {
    const matchSearch = c.code.toLowerCase().includes(search.toLowerCase());
    const isExpired = c.expiryDate && new Date() > new Date(c.expiryDate);

    if (filterStatus === 'active') return matchSearch && c.active && !isExpired;
    if (filterStatus === 'inactive') return matchSearch && !c.active;
    if (filterStatus === 'expired') return matchSearch && isExpired;
    return matchSearch;
  });

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Tag className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Coupons & Discount Codes
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure promotional coupons, flat rupee discounts, percentage off, and validity periods.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Coupon</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Codes</span>
            <Tag className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{totalCoupons}</p>
          <p className="text-[11px] text-slate-400 mt-1">Configured in platform</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active & Ready</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{activeCoupons}</p>
          <p className="text-[11px] text-slate-400 mt-1">Ready for checkout</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Redemptions</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{totalUsed}</p>
          <p className="text-[11px] text-slate-400 mt-1">Used during candidate checkout</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Max Discount</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-2">₹{maxDiscount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Highest saving offered</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search coupon code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['all', 'active', 'inactive', 'expired'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                filterStatus === status
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Loading coupons...</p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Tag className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No coupons found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {search ? 'Try refining your search keyword.' : 'Click "Add New Coupon" above to create your first discount coupon.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Coupon Code</th>
                  <th className="py-3.5 px-4">Discount Amount</th>
                  <th className="py-3.5 px-4">Redemptions</th>
                  <th className="py-3.5 px-4">Expiry Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredCoupons.map((coupon) => {
                  const isExpired = coupon.expiryDate && new Date() > new Date(coupon.expiryDate);
                  return (
                    <tr key={coupon._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition">
                      {/* Code */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-xs tracking-wider border border-slate-200 dark:border-slate-700">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => handleCopy(coupon.code)}
                            className="p-1 text-slate-400 hover:text-indigo-600 transition"
                            title="Copy code"
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Discount Amount */}
                      <td className="py-3 px-4 font-bold">
                        {coupon.discountType === 'flat' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-black">
                            <span>₹{coupon.discountValue} OFF</span>
                            <span className="text-[10px] font-medium text-slate-400">(Flat discount)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-black">
                            <span>{coupon.discountValue}% OFF</span>
                            <span className="text-[10px] font-medium text-slate-400">(Percentage)</span>
                          </span>
                        )}
                      </td>

                      {/* Redemptions */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {coupon.usedCount || 0}
                            </span>
                            <span className="text-slate-400">/ {coupon.usageLimit || 1000}</span>
                          </div>
                          <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 rounded-full" 
                              style={{ width: `${Math.min(100, (((coupon.usedCount || 0) / (coupon.usageLimit || 1000)) * 100))}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className={isExpired ? 'text-rose-500 font-bold' : 'text-slate-600 dark:text-slate-400'}>
                            {coupon.expiryDate 
                              ? new Date(coupon.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                              : 'Never'}
                          </span>
                          {isExpired && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                              Expired
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(coupon)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition ${
                            coupon.active && !isExpired
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {coupon.active && !isExpired ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>{isExpired ? 'Expired' : 'Disabled'}</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(coupon)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition"
                            title="Edit coupon"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                            title="Delete coupon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Coupon Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Promotional Coupon'}
        subtitle="Provide discount amounts and validity details for checkout."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Coupon Code Input */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Coupon Code <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="e.g. MOCK400, SUPER50"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono uppercase font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleGenerateCode}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition flex items-center gap-1"
                title="Generate Random Code"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Auto</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Codes will be automatically transformed to uppercase.</p>
          </div>

          {/* Discount Type */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Discount Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDiscountType('flat')}
                className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition ${
                  discountType === 'flat'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-sm font-black">₹</span>
                <span>Flat Amount Off</span>
              </button>

              <button
                type="button"
                onClick={() => setDiscountType('percent')}
                className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition ${
                  discountType === 'percent'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                <span>Percentage Off</span>
              </button>
            </div>
          </div>

          {/* Discount Value */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Discount Amount {discountType === 'flat' ? '(in Rupees ₹)' : '(Percentage %)'} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                {discountType === 'flat' ? '₹' : '%'}
              </span>
              <input
                type="number"
                required
                min="1"
                max={discountType === 'percent' ? 100 : 999}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'flat' ? '400' : '20'}
                className="w-full pl-8 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {discountType === 'flat' 
                ? `Candidates will receive flat ₹${discountValue || 0} off their total enrollment amount.` 
                : `Candidates will receive ${discountValue || 0}% discount off the base price.`}
            </p>
          </div>

          {/* Expiry Date & Usage Limit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Usage Limit
              </label>
              <input
                type="number"
                min="1"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Active Status Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="couponActive"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="couponActive" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Active immediately (can be redeemed at checkout)
            </label>
          </div>

          {/* Calculation Live Preview */}
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
            <div className="flex justify-between font-medium text-slate-500">
              <span>Standard Access Pass:</span>
              <span>₹999</span>
            </div>
            <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
              <span>Discount ({code || 'COUPON'}):</span>
              <span>- ₹{discountType === 'flat' ? (discountValue || 0) : Math.round(999 * ((discountValue || 0) / 100))}</span>
            </div>
            <div className="flex justify-between font-black text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
              <span>Candidate Pays:</span>
              <span className="text-sm">
                ₹{Math.max(1, 999 - (discountType === 'flat' ? (discountValue || 0) : Math.round(999 * ((discountValue || 0) / 100))))}
              </span>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition disabled:opacity-60"
            >
              {saving ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
