import React, { useCallback, useEffect, useState } from 'react'
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../api/finance'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'

const CATEGORIES = [
  'Salary', 'Freelance', 'Investment', 'Rental', 'Bonus', 'Other Income',
  'Rent', 'Utilities', 'Groceries', 'Transport', 'Healthcare',
  'Entertainment', 'Subscriptions', 'Insurance', 'Office Supplies', 'Marketing',
]

const fmt = (v) =>
  Number(v).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

const canWrite = (role) => role === 'admin' || role === 'analyst'
const canDelete = (role) => role === 'admin'

// ── Modal ──────────────────────────────────────────────────────────────────────
const TransactionModal = ({ txn, onClose, onSave }) => {
  const [form, setForm] = useState({
    amount: txn ? String(txn.amount) : '',
    type: txn?.type ?? 'expense',
    category: txn?.category ?? 'Rent',
    transaction_date: txn?.transaction_date ?? new Date().toISOString().split('T')[0],
    description: txn?.description ?? '',
    notes: txn?.notes ?? '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (txn) {
        await updateTransaction(txn.id, form)
        toast.success('Transaction updated')
      } else {
        await createTransaction(form)
        toast.success('Transaction created')
      }
      onSave()
      onClose()
    } catch (err) {
      const msg = err?.response?.data?.detail
      toast.error(msg ?? 'Failed to save transaction')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{txn ? 'Edit Transaction' : 'New Transaction'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Amount ($)</label>
              <input type="number" step="0.01" min="0.01" value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="input" required />
            </div>
            <div>
              <label className="label">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input">
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" value={form.transaction_date}
              onChange={(e) => setForm({ ...form, transaction_date: e.target.value })}
              className="input" required />
          </div>
          <div>
            <label className="label">Description</label>
            <input type="text" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input" />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="input resize-none" rows={2} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
const TransactionsPage = () => {
  const { user } = useAuth()
  const [data, setData] = useState({ total: 0, items: [] })
  const [page, setPage] = useState(1)
  const [filterType, setFilterType] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState({ open: false, txn: null })

  const PAGE_SIZE = 15

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getTransactions({
        type: filterType || undefined,
        category: filterCategory || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        page,
        page_size: PAGE_SIZE,
      })
      setData({ total: res.total, items: res.items })
    } finally {
      setLoading(false)
    }
  }, [filterType, filterCategory, dateFrom, dateTo, page])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async (txn) => {
    if (!confirm(`Delete transaction #${txn.id}?`)) return
    try {
      await deleteTransaction(txn.id)
      toast.success('Transaction deleted')
      fetchData()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const totalPages = Math.ceil(data.total / PAGE_SIZE)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
        {canWrite(user?.role ?? '') && (
          <button onClick={() => setModal({ open: true, txn: null })} className="btn-primary flex items-center gap-1">
            <Plus size={16} /> New
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1) }} className="input">
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input type="text" placeholder="Category…" value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setPage(1) }} className="input" />
        <input type="date" value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1) }} className="input" />
        <input type="date" value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1) }} className="input" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['#', 'Date', 'Type', 'Category', 'Amount', 'Description', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No transactions found</td></tr>
              ) : data.items.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">{t.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{t.transaction_date}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">{t.category}</td>
                  <td className={`px-4 py-3 font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                    {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 truncate max-w-xs">{t.description}</td>
                  <td className="px-4 py-3 flex gap-2">
                    {canWrite(user?.role ?? '') && (
                      <button onClick={() => setModal({ open: true, txn: t })} className="text-indigo-500 hover:text-indigo-700">
                        <Pencil size={15} />
                      </button>
                    )}
                    {canDelete(user?.role ?? '') && (
                      <button onClick={() => handleDelete(t)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{data.total} records &mdash; page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {modal.open && (
        <TransactionModal txn={modal.txn} onClose={() => setModal({ open: false, txn: null })} onSave={fetchData} />
      )}
    </div>
  )
}

export default TransactionsPage
