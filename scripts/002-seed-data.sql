-- Seed users (passwords are hashed with bcrypt - these are example hashes)
-- admin123, analyst123, viewer123, analyst123
INSERT INTO users (email, username, hashed_password, full_name, role, is_active) VALUES
    ('admin@finance.com', 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.qVz7YF5i6YL6Ky', 'Alice Admin', 'admin', true),
    ('analyst@finance.com', 'analyst', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.qVz7YF5i6YL6Ky', 'Bob Analyst', 'analyst', true),
    ('viewer@finance.com', 'viewer', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.qVz7YF5i6YL6Ky', 'Carol Viewer', 'viewer', true),
    ('analyst2@finance.com', 'analyst2', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.qVz7YF5i6YL6Ky', 'David Analyst', 'analyst', true)
ON CONFLICT (email) DO NOTHING;

-- Seed sample transactions
INSERT INTO transactions (amount, type, category, transaction_date, description, notes, created_by) VALUES
    -- Income transactions
    (5000.00, 'income', 'Salary', CURRENT_DATE - INTERVAL '30 days', 'Monthly salary payment', 'January salary', 1),
    (5000.00, 'income', 'Salary', CURRENT_DATE - INTERVAL '60 days', 'Monthly salary payment', 'December salary', 1),
    (1500.00, 'income', 'Freelance', CURRENT_DATE - INTERVAL '15 days', 'Freelance project payment', 'Website project', 2),
    (800.00, 'income', 'Investment', CURRENT_DATE - INTERVAL '45 days', 'Dividend / interest payout', 'Q4 dividends', 1),
    (2000.00, 'income', 'Rental', CURRENT_DATE - INTERVAL '20 days', 'Monthly rental income', 'Property A rent', 1),
    (3000.00, 'income', 'Bonus', CURRENT_DATE - INTERVAL '90 days', 'Annual performance bonus', 'Year-end bonus', 2),
    (500.00, 'income', 'Other Income', CURRENT_DATE - INTERVAL '10 days', 'Miscellaneous income', 'Consulting fee', 2),
    
    -- Expense transactions
    (1200.00, 'expense', 'Rent', CURRENT_DATE - INTERVAL '5 days', 'Monthly office/home rent', 'Office space rent', 1),
    (250.00, 'expense', 'Utilities', CURRENT_DATE - INTERVAL '8 days', 'Electricity, water, internet', 'Monthly utilities', 1),
    (400.00, 'expense', 'Groceries', CURRENT_DATE - INTERVAL '3 days', 'Weekly grocery run', 'Office supplies', 2),
    (150.00, 'expense', 'Transport', CURRENT_DATE - INTERVAL '12 days', 'Fuel and commute costs', 'Monthly fuel', 1),
    (300.00, 'expense', 'Healthcare', CURRENT_DATE - INTERVAL '25 days', 'Medical expenses', 'Annual checkup', 2),
    (200.00, 'expense', 'Entertainment', CURRENT_DATE - INTERVAL '7 days', 'Team outing / events', 'Team lunch', 1),
    (50.00, 'expense', 'Subscriptions', CURRENT_DATE - INTERVAL '2 days', 'Software subscription', 'Cloud services', 2),
    (500.00, 'expense', 'Insurance', CURRENT_DATE - INTERVAL '60 days', 'Annual insurance premium', 'Health insurance', 1),
    (100.00, 'expense', 'Office Supplies', CURRENT_DATE - INTERVAL '14 days', 'Stationery and supplies', 'Printer ink', 2),
    (800.00, 'expense', 'Marketing', CURRENT_DATE - INTERVAL '18 days', 'Digital marketing spend', 'Social media ads', 1),
    
    -- More varied transactions
    (4800.00, 'income', 'Salary', CURRENT_DATE - INTERVAL '120 days', 'Monthly salary payment', 'October salary', 1),
    (2200.00, 'income', 'Freelance', CURRENT_DATE - INTERVAL '75 days', 'Freelance project payment', 'Mobile app project', 2),
    (1100.00, 'expense', 'Rent', CURRENT_DATE - INTERVAL '35 days', 'Monthly office/home rent', 'Office space rent', 1),
    (180.00, 'expense', 'Utilities', CURRENT_DATE - INTERVAL '40 days', 'Electricity, water, internet', 'Monthly utilities', 2),
    (350.00, 'expense', 'Groceries', CURRENT_DATE - INTERVAL '22 days', 'Weekly grocery run', 'Team snacks', 1),
    (600.00, 'expense', 'Marketing', CURRENT_DATE - INTERVAL '50 days', 'Digital marketing spend', 'Google ads', 2),
    (1000.00, 'income', 'Investment', CURRENT_DATE - INTERVAL '100 days', 'Dividend / interest payout', 'Q3 dividends', 1),
    (75.00, 'expense', 'Subscriptions', CURRENT_DATE - INTERVAL '55 days', 'Software subscription', 'Design tools', 1);
