import {
  mockUsers,
  mockTransactions,
  generateDashboardSummary,
  validateCredentials,
  setCurrentUser,
  getCurrentUser,
} from './mockData'

// Simulate network delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// ── Auth ─────────────────────────────────────────────────────────────────────
export const login = async (username, password) => {
  await delay()
  const user = validateCredentials(username, password)
  if (!user) {
    throw { response: { status: 401, data: { detail: 'Invalid credentials' } } }
  }
  setCurrentUser(user.id)
  return { access_token: `mock_token_${user.id}_${Date.now()}` }
}

export const getMe = async () => {
  await delay(100)
  const user = getCurrentUser()
  if (!user) {
    throw { response: { status: 401, data: { detail: 'Not authenticated' } } }
  }
  const { password, ...safeUser } = user
  return safeUser
}

// ── Users ────────────────────────────────────────────────────────────────────
export const getUsers = async () => {
  await delay()
  return mockUsers.map(({ password, ...u }) => u)
}

export const createUser = async (data) => {
  await delay()
  const exists = mockUsers.find(u => u.username === data.username || u.email === data.email)
  if (exists) {
    throw { response: { data: { detail: 'Username or email already exists' } } }
  }
  const newUser = {
    id: mockUsers.length + 1,
    ...data,
    is_active: true,
    created_at: new Date().toISOString(),
  }
  mockUsers.push(newUser)
  const { password, ...safeUser } = newUser
  return safeUser
}

export const updateUser = async (id, data) => {
  await delay()
  const user = mockUsers.find(u => u.id === id)
  if (!user) {
    throw { response: { data: { detail: 'User not found' } } }
  }
  Object.assign(user, data)
  const { password, ...safeUser } = user
  return safeUser
}

export const deleteUser = async (id) => {
  await delay()
  const idx = mockUsers.findIndex(u => u.id === id)
  if (idx === -1) {
    throw { response: { data: { detail: 'User not found' } } }
  }
  mockUsers.splice(idx, 1)
}

// ── Transactions ─────────────────────────────────────────────────────────────
export const getTransactions = async (filters = {}) => {
  await delay()
  let items = [...mockTransactions]
  
  // Apply filters
  if (filters.type) {
    items = items.filter(t => t.type === filters.type)
  }
  if (filters.category) {
    items = items.filter(t => 
      t.category.toLowerCase().includes(filters.category.toLowerCase())
    )
  }
  if (filters.date_from) {
    items = items.filter(t => t.transaction_date >= filters.date_from)
  }
  if (filters.date_to) {
    items = items.filter(t => t.transaction_date <= filters.date_to)
  }
  
  const total = items.length
  
  // Pagination
  const page = filters.page || 1
  const pageSize = filters.page_size || 15
  const start = (page - 1) * pageSize
  const end = start + pageSize
  
  return {
    total,
    items: items.slice(start, end),
  }
}

export const createTransaction = async (data) => {
  await delay()
  const newTransaction = {
    id: Math.max(...mockTransactions.map(t => t.id)) + 1,
    ...data,
    amount: parseFloat(data.amount),
    user_id: getCurrentUser()?.id || 1,
    created_at: new Date().toISOString(),
  }
  mockTransactions.unshift(newTransaction)
  return newTransaction
}

export const updateTransaction = async (id, data) => {
  await delay()
  const txn = mockTransactions.find(t => t.id === id)
  if (!txn) {
    throw { response: { data: { detail: 'Transaction not found' } } }
  }
  Object.assign(txn, {
    ...data,
    amount: data.amount ? parseFloat(data.amount) : txn.amount,
  })
  return txn
}

export const deleteTransaction = async (id) => {
  await delay()
  const idx = mockTransactions.findIndex(t => t.id === id)
  if (idx === -1) {
    throw { response: { data: { detail: 'Transaction not found' } } }
  }
  mockTransactions.splice(idx, 1)
}

// ── Dashboard ────────────────────────────────────────────────────────────────
export const getDashboardSummary = async (year) => {
  await delay()
  return generateDashboardSummary(year)
}
