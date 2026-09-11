import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { 
  Users, 
  GraduationCap, 
  Trophy, 
  BookOpen, 
  Briefcase, 
  TrendingUp, 
  Clock, 
  ShieldCheck,
  BarChart2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#06B6D4'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/analytics/platform');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-64 animate-pulse" />
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { metrics, categoryStats, scoreBuckets, recentAttempts } = data;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Platform Overview & Telemetry
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Real-time metrics on candidate registrations, exam throughput, score distributions, and curriculum health.
        </p>
      </div>

      {/* 1. Metrics Cards (5 KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Users</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
            {metrics.totalUsers}
          </p>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">Registered candidates</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Published Tests</span>
            <GraduationCap className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
            {metrics.totalTests}
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Mock test simulators</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Attempts</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
            {metrics.totalAttempts}
          </p>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Examinations graded</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Study Resources</span>
            <BookOpen className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
            {metrics.totalResources}
          </p>
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">PDFs & Videos</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Jobs</span>
            <Briefcase className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
            {metrics.totalJobs}
          </p>
          <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">Open placements</span>
        </div>
      </div>

      {/* 2. Platform Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Test Volumes & Scores (2 Columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Exam Stream Engagement & Average Accuracy
              </h3>
              <p className="text-xs text-slate-400">Total attempts recorded and mean accuracy per stream</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
              Streams
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" opacity={0.3} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickFormatter={(v) => v.split(' ')[0]} />
                <YAxis stroke="#94A3B8" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="attemptsCount" name="Attempts" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                <Bar dataKey="averageAccuracy" name="Avg Accuracy %" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Distribution Buckets (1 Column) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Score Distribution
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Candidate accuracy band dispersion</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scoreBuckets}
                  dataKey="count"
                  nameKey="range"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {scoreBuckets.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            {scoreBuckets.map((b, idx) => (
              <div key={idx} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="block font-bold text-slate-700 dark:text-slate-300">{b.range}</span>
                <span className="text-[11px] text-slate-400">{b.count} attempts</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Recent Platform Exam Attempts */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Recent Candidate Examination Submissions
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-3.5 rounded-l-xl">Candidate</th>
                <th className="p-3.5">Test Title</th>
                <th className="p-3.5">Score</th>
                <th className="p-3.5">Accuracy</th>
                <th className="p-3.5">Time Spent</th>
                <th className="p-3.5 rounded-r-xl">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentAttempts.map((att) => (
                <tr key={att._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                    {att.userId?.name || 'Anonymous'}
                    <span className="block text-[11px] font-normal text-slate-400">{att.userId?.email}</span>
                  </td>
                  <td className="p-3.5 text-slate-700 dark:text-slate-300">
                    {att.testId?.title || 'Mock Simulator'}
                  </td>
                  <td className="p-3.5 font-bold text-indigo-600 dark:text-indigo-400">
                    {att.score} / {att.totalMarks}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                      att.accuracyPercentage >= 70 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60' :
                      att.accuracyPercentage >= 40 ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60' :
                      'bg-rose-50 text-rose-600 dark:bg-rose-950/60'
                    }`}>
                      {att.accuracyPercentage}%
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-500">
                    {Math.round(att.timeSpentSeconds / 60)} mins
                  </td>
                  <td className="p-3.5 text-slate-400">
                    {new Date(att.submittedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
