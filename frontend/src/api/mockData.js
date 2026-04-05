// ── Mock Users ────────────────────────────────────────────────────────────────
export const mockUsers = [
  {
    id: 1,
    email: 'admin@example.com',
    username: 'admin',
    password: 'admin123',
    full_name: 'John Administrator',
    role: 'admin',
    is_active: true,
    created_at: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    email: 'analyst@example.com',
    username: 'analyst',
    password: 'analyst123',
    full_name: 'Sarah Analyst',
    role: 'analyst',
    is_active: true,
    created_at: '2024-02-20T14:15:00Z',
  },
  {
    id: 3,
    email: 'viewer@example.com',
    username: 'viewer',
    password: 'viewer123',
    full_name: 'Mike Viewer',
    role: 'viewer',
    is_active: true,
    created_at: '2024-03-10T09:00:00Z',
  },
]

// ── Mock Transactions ─────────────────────────────────────────────────────────
const categories = {
  income: ['Salary', 'Freelance', 'Investment', 'Rental', 'Bonus', 'Other Income'],
  expense: ['Rent', 'Utilities', 'Groceries', 'Transport', 'Healthcare', 'Entertainment', 'Subscriptions', 'Insurance', 'Office Supplies', 'Marketing'],
}

const descriptions = {
  Salary: ['Monthly salary', 'Bi-weekly paycheck', 'Year-end bonus'],
  Freelance: ['Web design project', 'Consulting work', 'Logo design'],
  Investment: ['Stock dividends', 'Bond interest', 'Real estate income'],
  Rental: ['Property rental', 'Equipment lease'],
  Bonus: ['Performance bonus', 'Holiday bonus', 'Referral bonus'],
  'Other Income': ['Gift received', 'Refund', 'Cash back'],
  Rent: ['Monthly rent payment', 'Office rent'],
  Utilities: ['Electric bill', 'Water bill', 'Internet service', 'Gas bill'],
  Groceries: ['Weekly groceries', 'Supermarket shopping', 'Food supplies'],
  Transport: ['Gas station', 'Public transit', 'Uber ride', 'Car maintenance'],
  Healthcare: ['Doctor visit', 'Pharmacy', 'Health insurance'],
  Entertainment: ['Movie tickets', 'Concert', 'Streaming service', 'Video games'],
  Subscriptions: ['Netflix', 'Spotify', 'Software license', 'Magazine'],
  Insurance: ['Car insurance', 'Life insurance', 'Property insurance'],
  'Office Supplies': ['Printer ink', 'Stationery', 'Computer accessories'],
  Marketing: ['Social media ads', 'Print advertising', 'Email marketing'],
}

function generateTransactions() {
  const transactions = []
  let id = 1
  
  // Generate transactions for 2024 and 2025
  for (let year = 2024; year <= 2026; year++) {
    const monthsToGenerate = year === 2026 ? 4 : 12
    for (let month = 1; month <= monthsToGenerate; month++) {
      // Generate 8-15 transactions per month
      const numTransactions = Math.floor(Math.random() * 8) + 8
      
      for (let i = 0; i < numTransactions; i++) {
        const type = Math.random() > 0.4 ? 'expense' : 'income'
        const categoryList = categories[type]
        const category = categoryList[Math.floor(Math.random() * categoryList.length)]
        const descList = descriptions[category] || ['General transaction']
        const description = descList[Math.floor(Math.random() * descList.length)]
        
        // Generate realistic amounts based on category
        let amount
        if (type === 'income') {
          amount = category === 'Salary' 
            ? Math.floor(Math.random() * 3000) + 4000 
            : Math.floor(Math.random() * 1500) + 200
        } else {
          amount = category === 'Rent' 
            ? Math.floor(Math.random() * 500) + 1200
            : Math.floor(Math.random() * 300) + 20
        }
        
        const day = Math.floor(Math.random() * 28) + 1
        const transaction_date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        
        transactions.push({
          id: id++,
          amount: amount,
          type,
          category,
          transaction_date,
          description,
          notes: Math.random() > 0.7 ? 'Recurring payment' : '',
          user_id: Math.floor(Math.random() * 3) + 1,
          created_at: `${transaction_date}T12:00:00Z`,
        })
      }
    }
  }
  
  // Sort by date descending
  return transactions.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
}

export const mockTransactions = generateTransactions()

// ── Dashboard Summary Generator ───────────────────────────────────────────────
export function generateDashboardSummary(year) {
  let transactions = mockTransactions
  
  if (year) {
    transactions = transactions.filter(t => t.transaction_date.startsWith(String(year)))
  }
  
  const total_income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const total_expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  
  // Monthly trends
  const monthlyMap = {}
  transactions.forEach(t => {
    const [y, m] = t.transaction_date.split('-')
    const key = `${y}-${m}`
    if (!monthlyMap[key]) {
      monthlyMap[key] = { year: parseInt(y), month: parseInt(m), income: 0, expense: 0 }
    }
    if (t.type === 'income') {
      monthlyMap[key].income += t.amount
    } else {
      monthlyMap[key].expense += t.amount
    }
  })
  
  const monthly_trends = Object.values(monthlyMap)
    .map(m => ({ ...m, net: m.income - m.expense }))
    .sort((a, b) => a.year === b.year ? a.month - b.month : a.year - b.year)
  
  // Expense by category
  const categoryMap = {}
  transactions.filter(t => t.type === 'expense').forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount
  })
  
  const expense_by_category = Object.entries(categoryMap)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
  
  // Recent transactions
  const recent_transactions = transactions.slice(0, 10)
  
  return {
    total_income,
    total_expenses,
    net_balance: total_income - total_expenses,
    transaction_count: transactions.length,
    monthly_trends,
    expense_by_category,
    recent_transactions,
  }
}

// ── Token Management ──────────────────────────────────────────────────────────
let currentUserId = null

export function setCurrentUser(userId) {
  currentUserId = userId
}

export function getCurrentUser() {
  if (!currentUserId) return null
  return mockUsers.find(u => u.id === currentUserId) || null
}

export function validateCredentials(username, password) {
  const user = mockUsers.find(u => u.username === username && u.password === password)
  return user || null
}
