import React, { useEffect, useState } from 'react'
import { getDashboardSummary } from '../api/finance'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const COLORS = [
  '#6366f1', '#22c55e', '#f59e0b', '#ef4444',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
]

const fmt = (v) =>
  Number(v).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

const StatCard = ({ title, value, icon, color }) => (
  <div className={`bg-white rounded-xl shadow p-5 flex items-center gap-4 border-l-4 ${color}`}>
    <div className="p-3 rounded-full bg-gray-100">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
)

const DashboardPage = () => {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState('')

  useEffect(() => {
    setLoading(true)
    getDashboardSummary(year === '' ? undefined : year)
      .then(setSummary)
      .finally(() => setLoading(false))
  }, [year])

  if (loading) return <div className="p-8 text-gray-500">Loading dashboard…</div>
  if (!summary) return null

  const monthlyData = summary.monthly_trends.map((t) => ({
    name: `${MONTH_NAMES[t.month - 1]} ${t.year}`,
    Income: Number(t.income),
    Expense: Number(t.expense),
    Net: Number(t.net),
  }))

  const expensePieData = summary.expense_by_category.slice(0, 8).map((c) => ({
    name: c.category,
    value: Number(c.total),
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value === '' ? '' : Number(e.target.value))}
          className="border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Time</option>
          <option value={2024}>2024</option>
          <option value={2025}>2025</option>
          <option value={2026}>2026</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Income"
          value={fmt(summary.total_income)}
          icon={<TrendingUp size={22} className="text-green-500" />}
          color="border-green-400"
        />
        <StatCard
          title="Total Expenses"
          value={fmt(summary.total_expenses)}
          icon={<TrendingDown size={22} className="text-red-500" />}
          color="border-red-400"
        />
        <StatCard
          title="Net Balance"
          value={fmt(summary.net_balance)}
          icon={<DollarSign size={22} className="text-indigo-500" />}
          color={Number(summary.net_balance) >= 0 ? 'border-indigo-400' : 'border-orange-400'}
        />
        <StatCard
          title="Transactions"
          value={String(summary.transaction_count)}
          icon={<Activity size={22} className="text-blue-500" />}
          color="border-blue-400"
        />
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Monthly Trends</h2>
        {monthlyData.length === 0 ? (
          <p className="text-gray-400 text-sm">No data for selected year</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Legend />
              <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category Pie + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Expense Pie */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Expenses by Category</h2>
          {expensePieData.length === 0 ? (
            <p className="text-gray-400 text-sm">No expense data</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={expensePieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {expensePieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Transactions</h2>
          <div className="overflow-auto max-h-60">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b">
                  <th className="text-left pb-2">Date</th>
                  <th className="text-left pb-2">Category</th>
                  <th className="text-right pb-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {summary.recent_transactions.map((t) => (
                  <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2 text-gray-500">{t.transaction_date}</td>
                    <td className="py-2">{t.category}</td>
                    <td className={`py-2 text-right font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                      {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
