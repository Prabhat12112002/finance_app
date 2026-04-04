import React, { useEffect, useState } from 'react'
import { getUsers, createUser, updateUser, deleteUser } from '../api/finance'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, UserCheck, UserX } from 'lucide-react'

// ── Create User Modal ──────────────────────────────────────────────────────────
const CreateUserModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({ email: '', username: '', password: '', full_name: '', role: 'viewer' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createUser(form)
      toast.success('User created')
      onSave()
      onClose()
    } catch (err) {
      const msg = err?.response?.data?.detail
      toast.error(msg ?? 'Failed to create user')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create User</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="label">Username</label>
            <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="label">Full Name (optional)</label>
            <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input">
              <option value="viewer">Viewer</option>
              <option value="analyst">Analyst</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating…' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Edit User Modal ─────────────────────────────────────────────────────────────
const EditUserModal = ({ user, onClose, onSave }) => {
  const [form, setForm] = useState({ full_name: user.full_name ?? '', role: user.role, is_active: user.is_active })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateUser(user.id, form)
      toast.success('User updated')
      onSave()
      onClose()
    } catch {
      toast.error('Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit User — {user.username}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label">Full Name</label>
            <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input">
              <option value="viewer">Viewer</option>
              <option value="analyst">Analyst</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Users Page ─────────────────────────────────────────────────────────────────
const UsersPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState(null)

  const fetchUsers = () => {
    setLoading(true)
    getUsers().then(setUsers).finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [])

  const handleDelete = async (u) => {
    if (!confirm(`Delete user "${u.username}"?`)) return
    try {
      await deleteUser(u.id)
      toast.success('User deleted')
      fetchUsers()
    } catch {
      toast.error('Failed to delete user')
    }
  }

  const roleColor = {
    admin: 'bg-red-100 text-red-700',
    analyst: 'bg-blue-100 text-blue-700',
    viewer: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-1">
          <Plus size={16} /> New User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['#', 'Username', 'Email', 'Full Name', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">{u.id}</td>
                  <td className="px-4 py-3 font-medium">{u.username}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">{u.full_name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${roleColor[u.role]}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    {u.is_active
                      ? <span className="flex items-center gap-1 text-green-600"><UserCheck size={14} /> Active</span>
                      : <span className="flex items-center gap-1 text-gray-400"><UserX size={14} /> Inactive</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => setEditUser(u)} className="text-indigo-500 hover:text-indigo-700"><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(u)} className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {createOpen && <CreateUserModal onClose={() => setCreateOpen(false)} onSave={fetchUsers} />}
      {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} onSave={fetchUsers} />}
    </div>
  )
}

export default UsersPage
