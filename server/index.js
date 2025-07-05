const express = require('express');
const cors = require('cors');
const { supabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/test', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('count(*)', { count: 'exact' })
      .limit(1);
    
    if (error) {
      res.json({ 
        status: 'error', 
        database: 'supabase', 
        error: error.message,
        suggestion: 'Tables might not exist. Run the SQL schema in Supabase dashboard.'
      });
    } else {
      res.json({ status: 'success', database: 'supabase', connection: 'working' });
    }
  } catch (err) {
    res.json({ status: 'error', database: 'supabase', error: err.message });
  }
});

// Contacts API
app.get('/api/contacts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('name');
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/contacts', async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    console.log('Creating contact:', { name, phone, email, address });
    
    const { data, error } = await supabase
      .from('contacts')
      .insert([{ name, phone, email, address }])
      .select();
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    console.log('Contact created successfully:', data);
    res.json({ id: data[0].id });
  } catch (err) {
    console.error('Error creating contact:', err);
    res.status(500).json({ error: err.message });
  }
});

// Loans API
app.get('/api/loans', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        contacts (
          name
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Format data to match expected structure
    const formattedData = data.map(loan => ({
      ...loan,
      contact_name: loan.contacts?.name
    }));
    
    res.json(formattedData);
  } catch (err) {
    console.error('Error fetching loans:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/loans', async (req, res) => {
  try {
    const { contact_id, amount, interest_rate, interest_type, start_date, due_date, notes } = req.body;
    
    const { data, error } = await supabase
      .from('loans')
      .insert([{
        contact_id,
        amount,
        interest_rate,
        interest_type: interest_type || 'simple',
        start_date,
        due_date,
        notes
      }])
      .select();
    
    if (error) throw error;
    res.json({ id: data[0].id });
  } catch (err) {
    console.error('Error creating loan:', err);
    res.status(500).json({ error: err.message });
  }
});

// Payments API
app.get('/api/payments/:loanId', async (req, res) => {
  try {
    const loanId = req.params.loanId;
    
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('loan_id', loanId)
      .order('payment_date', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/payments', async (req, res) => {
  try {
    const { loan_id, amount, payment_date, payment_method, notes } = req.body;
    
    const { data, error } = await supabase
      .from('payments')
      .insert([{
        loan_id,
        amount,
        payment_date,
        payment_method,
        notes
      }])
      .select();
    
    if (error) throw error;
    res.json({ id: data[0].id });
  } catch (err) {
    console.error('Error creating payment:', err);
    res.status(500).json({ error: err.message });
  }
});

// Calculate outstanding balance for a loan
app.get('/api/loans/:id/balance', async (req, res) => {
  try {
    const loanId = req.params.id;
    
    // Get loan details
    const { data: loanData, error: loanError } = await supabase
      .from('loans')
      .select('*')
      .eq('id', loanId)
      .single();
    
    if (loanError) throw loanError;
    if (!loanData) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    
    // Get total payments
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payments')
      .select('amount')
      .eq('loan_id', loanId);
    
    if (paymentsError) throw paymentsError;
    
    const totalPaid = paymentsData.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const startDate = new Date(loanData.start_date);
    const currentDate = new Date();
    const daysDiff = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
    
    let totalOwed;
    const principal = parseFloat(loanData.amount);
    const rate = parseFloat(loanData.interest_rate);
    
    if (loanData.interest_type === 'compound') {
      const dailyRate = rate / 100 / 365;
      totalOwed = principal * Math.pow(1 + dailyRate, daysDiff);
    } else {
      const dailyRate = rate / 100 / 365;
      totalOwed = principal * (1 + dailyRate * daysDiff);
    }
    
    const balance = totalOwed - totalPaid;
    
    res.json({
      original_amount: principal,
      total_owed: totalOwed,
      total_paid: totalPaid,
      balance: balance,
      days_elapsed: daysDiff
    });
  } catch (err) {
    console.error('Error calculating balance:', err);
    res.status(500).json({ error: err.message });
  }
});

// Transactions API
app.get('/api/transactions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('transaction_date', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const { type, amount, category, description, payment_method, transaction_date } = req.body;
    
    if (!type || !amount || !category || !transaction_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        type,
        amount: parseFloat(amount),
        category,
        description,
        payment_method,
        transaction_date
      }])
      .select();
    
    if (error) throw error;
    res.json({ id: data[0].id });
  } catch (err) {
    console.error('Error creating transaction:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, category, description, payment_method, transaction_date } = req.body;
    
    const { data, error } = await supabase
      .from('transactions')
      .update({
        type,
        amount: parseFloat(amount),
        category,
        description,
        payment_method,
        transaction_date,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    console.error('Error updating transaction:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting transaction:', err);
    res.status(500).json({ error: err.message });
  }
});

// Categories API
app.get('/api/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name, icon, color, budget_limit, type } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    const { data, error } = await supabase
      .from('categories')
      .insert([{
        name,
        icon,
        color,
        budget_limit: parseFloat(budget_limit || 0),
        type: type || 'expense'
      }])
      .select();
    
    if (error) throw error;
    res.json({ id: data[0].id });
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Using Supabase database only');
});