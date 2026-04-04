import api from './client'

// ── Auth ─────────────────────────────────────────────────────────────
export const login = async (username, password) => {
  const params = new URLSearchParams()
  params.append('username', username)
  params.append('password', password)
  const res = await api.post('/auth/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return res.data
}

export const getMe = async () => {
  const res = await api.get('/auth/me')
  return res.data
}

// ── Users ─────────────────────────────────────────────────────────────
export const getUsers = async () => {
  const res = await api.get('/users/')
  return res.data
}

export const createUser = async (data) => {
  const res = await api.post('/users/', data)
  return res.data
}

export const updateUser = async (id, data) => {
  const res = await api.patch(`/users/${id}`, data)
  return res.data
}

export const deleteUser = async (id) => {
  await api.delete(`/users/${id}`)
}

// ── Transactions ──────────────────────────────────────────────────────
export const getTransactions = async (filters = {}) => {
  const res = await api.get('/transactions/', { params: filters })
  return res.data
}

export const createTransaction = async (data) => {
  const res = await api.post('/transactions/', data)
  return res.data
}

export const updateTransaction = async (id, data) => {
  const res = await api.patch(`/transactions/${id}`, data)
  return res.data
}

export const deleteTransaction = async (id) => {
  await api.delete(`/transactions/${id}`)
}

// ── Dashboard ─────────────────────────────────────────────────────────
export const getDashboardSummary = async (year) => {
  const res = await api.get('/dashboard/summary', {
    params: year ? { year } : {},
  })
  return res.data
}
