CREATE TABLE IF NOT EXISTS borrowers (
         id SERIAL PRIMARY KEY,
         name VARCHAR(255) NOT NULL,
         contact VARCHAR(255),
         notes TEXT,
         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
         updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
     );

     -- Create loan_transactions table
     CREATE TABLE IF NOT EXISTS loan_transactions (
         id SERIAL PRIMARY KEY,
         borrower_id INTEGER NOT NULL,
         type VARCHAR(20) NOT NULL CHECK (type IN ('given', 'received')),
         amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
         interest_rate DECIMAL(5,2) NOT NULL CHECK (interest_rate >= 0),
         date DATE NOT NULL,
         due_date DATE,
         description TEXT,
         interest_earned DECIMAL(10,2) DEFAULT 0,
         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
         updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
         FOREIGN KEY (borrower_id) REFERENCES borrowers(id) ON DELETE CASCADE
     );

     -- Create indexes for better performance
     CREATE INDEX IF NOT EXISTS idx_loan_transactions_borrower_id ON loan_transactions(borrower_id);
     CREATE INDEX IF NOT EXISTS idx_loan_transactions_date ON loan_transactions(date);
     CREATE INDEX IF NOT EXISTS idx_loan_transactions_type ON loan_transactions(type);

     -- Create function to update timestamps
     CREATE OR REPLACE FUNCTION update_updated_at_column()
     RETURNS TRIGGER AS $$
     BEGIN
         NEW.updated_at = CURRENT_TIMESTAMP;
         RETURN NEW;
     END;
     $$ language 'plpgsql';

     -- Create triggers to update timestamps
     CREATE TRIGGER update_borrowers_updated_at
         BEFORE UPDATE ON borrowers
         FOR EACH ROW
         EXECUTE FUNCTION update_updated_at_column();

     CREATE TRIGGER update_loan_transactions_updated_at
         BEFORE UPDATE ON loan_transactions
         FOR EACH ROW
         EXECUTE FUNCTION update_updated_at_column();