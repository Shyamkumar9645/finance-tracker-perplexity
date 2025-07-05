-- Add transactions table for the finance tracker
CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  category VARCHAR(100) NOT NULL,
  description TEXT,
  payment_method VARCHAR(50),
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (you can restrict these later)
CREATE POLICY "Allow all operations on transactions" ON transactions FOR ALL USING (true);

-- Add categories table for transaction categories
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(10),
  color VARCHAR(7),
  budget_limit DECIMAL(12,2) DEFAULT 0,
  type VARCHAR(20) NOT NULL DEFAULT 'expense' CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations on categories
CREATE POLICY "Allow all operations on categories" ON categories FOR ALL USING (true);

-- Insert default categories
INSERT INTO categories (name, icon, color, budget_limit, type) VALUES
('Food & Dining', '🍽️', '#f59e0b', 500, 'expense'),
('Transportation', '🚗', '#3b82f6', 200, 'expense'),
('Shopping', '🛍️', '#ec4899', 300, 'expense'),
('Entertainment', '🎬', '#8b5cf6', 150, 'expense'),
('Bills & Utilities', '⚡', '#ef4444', 400, 'expense'),
('Healthcare', '🏥', '#10b981', 200, 'expense'),
('Education', '📚', '#06b6d4', 250, 'expense'),
('Travel', '✈️', '#84cc16', 500, 'expense'),
('Salary', '💼', '#10b981', 0, 'income'),
('Freelance', '💻', '#10b981', 0, 'income'),
('Investment', '📈', '#10b981', 0, 'income')
ON CONFLICT (name) DO NOTHING;