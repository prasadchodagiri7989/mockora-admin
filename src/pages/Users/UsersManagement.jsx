import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import Modal from '../../components/Modal';
import { 
  Users, 
  Search, 
  Shield, 
  Ban, 
  CheckCircle, 
  Trash2, 
  Eye, 
  EyeOff,
  Key,
  History,
  ArrowUpDown,
  Filter
} from 'lucide-react';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Attempt History Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  // Change Password Modal
  const [passwordUser, setPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [notifyUserByEmail, setNotifyUserByEmail] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let pass = 'Mock@';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
    setShowPassword(true);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordUser || !newPassword || newPassword.trim().length < 6) return;
    setPasswordLoading(true);
    setPasswordMsg({ text: '', type: '' });

    try {
      const res = await api.put(`/users/${passwordUser._id}/password`, {
        newPassword: newPassword.trim(),
        notifyUser: notifyUserByEmail,
      });
      if (res.data.success) {
        setPasswordMsg({ text: res.data.message || 'Password changed successfully!', type: 'success' });
        setTimeout(() => {
          setPasswordUser(null);
          setNewPassword('');
          setPasswordMsg({ text: '', type: '' });
        }, 1800);
      }
    } catch (err) {
      setPasswordMsg({
        text: err.response?.data?.message || 'Failed to update user password.',
        type: 'error',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search.trim()) query.append('search', search.trim());
      if (roleFilter !== 'all') query.append('role', roleFilter);
      if (statusFilter !== 'all') query.append('status', statusFilter);

      const res = await api.get(`/users?${query.toString()}`);
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'active' ? 'blocked' : 'active';
    if (!window.confirm(`Are you sure you want to change status of ${user.name} to ${nextStatus}?`)) return;

    try {
      const res = await api.put(`/users/${user._id}/status`, { status: nextStatus });
      if (res.data.success) {
        setUsers(users.map(u => u._id === user._id ? { ...u, status: nextStatus } : u));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleToggleRole = async (user) => {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to promote/change ${user.name} to ${nextRole}?`)) return;

    try {
      const res = await api.put(`/users/${user._id}/role`, { role: nextRole });
      if (res.data.success) {
        setUsers(users.map(u => u._id === user._id ? { ...u, role: nextRole } : u));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Permanently delete account for ${user.name}? This will remove all their test records.`)) return;

    try {
      const res = await api.delete(`/users/${user._id}`);
      if (res.data.success) {
        setUsers(users.filter(u => u._id !== user._id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Deletion failed');
    }
  };

  const handleViewAttempts = async (user) => {
    setSelectedUser(user);
    setLoadingAttempts(true);
    try {
      const res = await api.get(`/users/${user._id}/attempts`);
      if (res.data.success) {
        setAttempts(res.data.attempts);
      }
    } catch (err) {
      console.error('Failed to load user attempts:', err);
    } finally {
      setLoadingAttempts(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            User Accounts & Candidate History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage candidates and administrators, inspect examination records, and enforce account statuses.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
          />
        </form>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-3">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
        >
          <option value="all">All Roles</option>
          <option value="user">Candidates (User)</option>
          <option value="admin">Platform Admins</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="blocked">Suspended / Blocked</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading user directory...</div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No matching users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3.5 rounded-l-xl">User</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Target Exam</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Joined</th>
                  <th className="p-3.5 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                      <span className="text-[11px] text-slate-400">{u.email}</span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase ${
                        u.role === 'admin'
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50'
                          : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      {u.targetExam || 'General'}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        u.status === 'active'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-950/50'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewAttempts(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="View Test Attempts History"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setPasswordUser(u);
                            setNewPassword('');
                            setPasswordMsg({ text: '', type: '' });
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition"
                          title="Change User Password"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleRole(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title={u.role === 'admin' ? 'Demote to Candidate' : 'Promote to Admin'}
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-lg transition ${
                            u.status === 'active'
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={u.status === 'active' ? 'Block Account' : 'Unblock Account'}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Test History Modal */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => {
            setSelectedUser(null);
            setAttempts([]);
          }}
          title={`Test History: ${selectedUser.name}`}
          subtitle={`${selectedUser.email} • ${attempts.length} graded attempts`}
          maxWidth="max-w-3xl"
        >
          {loadingAttempts ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading attempt records...</div>
          ) : attempts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No mock tests attempted by this user yet.</div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {attempts.map((att) => (
                <div
                  key={att._id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {att.testId?.title || 'Mock Test'}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Submitted on {new Date(att.submittedAt).toLocaleString()} • Duration: {Math.round(att.timeSpentSeconds / 60)} mins
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
                      Score: {att.score} / {att.totalMarks}
                    </span>
                    <span className="block text-[10px] font-bold text-emerald-600">
                      {att.accuracyPercentage}% Accuracy
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Change Password Modal */}
      {passwordUser && (
        <Modal
          isOpen={!!passwordUser}
          onClose={() => {
            setPasswordUser(null);
            setNewPassword('');
            setPasswordMsg({ text: '', type: '' });
          }}
          title="Change User Password"
          subtitle={`Set a new login password for ${passwordUser.name} (${passwordUser.email})`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleChangePassword} className="space-y-4">
            {passwordMsg.text && (
              <div className={`p-3 rounded-xl text-xs font-semibold ${
                passwordMsg.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
              }`}>
                {passwordMsg.text}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  New Password
                </label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Generate Password
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters..."
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={notifyUserByEmail}
                onChange={(e) => setNotifyUserByEmail(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Send new credentials to user's registered email</span>
            </label>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setPasswordUser(null);
                  setNewPassword('');
                  setPasswordMsg({ text: '', type: '' });
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={passwordLoading || !newPassword || newPassword.trim().length < 6}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
