-- Add budgets table for the finance tracker
CREATE TABLE IF NOT EXISTS budgets (
  id BIGSERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  period VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_budgets_category_id ON budgets(category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_period ON budgets(period);
CREATE INDEX IF NOT EXISTS idx_budgets_status ON budgets(status);
CREATE INDEX IF NOT EXISTS idx_budgets_start_date ON budgets(start_date);
CREATE INDEX IF NOT EXISTS idx_budgets_end_date ON budgets(end_date);

-- Enable Row Level Security (RLS)
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (you can restrict these later)
CREATE POLICY "Allow all operations on budgets" ON budgets FOR ALL USING (true);

-- Insert some sample budgets
INSERT INTO budgets (category_id, name, amount, period, start_date, end_date, status, notes) VALUES
((SELECT id FROM categories WHERE name = 'Food & Dining'), 'Monthly Food Budget', 500.00, 'monthly', '2024-01-01', '2024-12-31', 'active', 'Monthly budget for food and dining expenses'),
((SELECT id FROM categories WHERE name = 'Transportation'), 'Monthly Transport Budget', 200.00, 'monthly', '2024-01-01', '2024-12-31', 'active', 'Monthly budget for transportation costs'),
((SELECT id FROM categories WHERE name = 'Entertainment'), 'Monthly Entertainment Budget', 150.00, 'monthly', '2024-01-01', '2024-12-31', 'active', 'Monthly budget for entertainment activities'),
((SELECT id FROM categories WHERE name = 'Shopping'), 'Monthly Shopping Budget', 300.00, 'monthly', '2024-01-01', '2024-12-31', 'active', 'Monthly budget for shopping expenses'),
((SELECT id FROM categories WHERE name = 'Healthcare'), 'Monthly Healthcare Budget', 200.00, 'monthly', '2024-01-01', '2024-12-31', 'active', 'Monthly budget for healthcare expenses')
ON CONFLICT DO NOTHING;