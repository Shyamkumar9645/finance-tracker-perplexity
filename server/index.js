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

app.put('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, color, budget_limit, type } = req.body;
    
    const { data, error } = await supabase
      .from('categories')
      .update({
        name,
        icon,
        color,
        budget_limit: parseFloat(budget_limit || 0),
        type: type || 'expense'
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: err.message });
  }
});

// Budgets API
app.get('/api/budgets', async (req, res) => {
  try {
    // Fetch budgets first
    const { data: budgets, error: budgetError } = await supabase
      .from('budgets')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (budgetError) throw budgetError;
    
    // Fetch categories separately
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('id, name, icon, color');
    
    if (categoryError) throw categoryError;
    
    // Map categories by id for quick lookup
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.id] = cat;
    });
    
    // Calculate spent amounts for each budget
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const category = categoryMap[budget.category_id];
        
        // Get transactions for this budget's category within the budget period
        const { data: transactions, error: transactionError } = await supabase
          .from('transactions')
          .select('amount')
          .eq('category', category?.name || '')
          .eq('type', 'expense')
          .gte('transaction_date', budget.start_date)
          .lte('transaction_date', budget.end_date);
        
        if (transactionError) {
          console.error('Error fetching transactions for budget:', transactionError);
        }
        
        const spent = transactions?.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0) || 0;
        const remaining = parseFloat(budget.amount) - spent;
        
        return {
          ...budget,
          category_name: category?.name,
          category_icon: category?.icon,
          category_color: category?.color,
          spent,
          remaining
        };
      })
    );
    
    res.json(budgetsWithSpent);
  } catch (err) {
    console.error('Error fetching budgets:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/budgets', async (req, res) => {
  try {
    const { category_id, name, amount, period, start_date, end_date, status, notes } = req.body;
    
    if (!category_id || !name || !amount || !start_date || !end_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const { data, error } = await supabase
      .from('budgets')
      .insert([{
        category_id,
        name,
        amount: parseFloat(amount),
        period: period || 'monthly',
        start_date,
        end_date,
        status: status || 'active',
        notes
      }])
      .select();
    
    if (error) throw error;
    res.json({ id: data[0].id });
  } catch (err) {
    console.error('Error creating budget:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/budgets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, name, amount, period, start_date, end_date, status, notes } = req.body;
    
    const { data, error } = await supabase
      .from('budgets')
      .update({
        category_id,
        name,
        amount: parseFloat(amount),
        period,
        start_date,
        end_date,
        status,
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    console.error('Error updating budget:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/budgets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting budget:', err);
    res.status(500).json({ error: err.message });
  }
});

// Dashboard Analytics API
app.get('/api/dashboard/summary', async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    // Get current month's transactions
    const { data: monthlyTransactions, error: monthlyError } = await supabase
      .from('transactions')
      .select('type, amount')
      .gte('transaction_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
      .lt('transaction_date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);
    
    if (monthlyError) throw monthlyError;
    
    // Get all transactions for total balance
    const { data: allTransactions, error: allError } = await supabase
      .from('transactions')
      .select('type, amount');
    
    if (allError) throw allError;
    
    // Calculate monthly income and expenses
    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    // Calculate total balance (all time income - expenses)
    const totalIncome = allTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const totalExpenses = allTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const totalBalance = totalIncome - totalExpenses;
    
    // Calculate savings rate
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100) : 0;
    
    res.json({
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      savingsRate: Math.round(savingsRate * 100) / 100,
      totalIncome,
      totalExpenses
    });
  } catch (err) {
    console.error('Error fetching dashboard summary:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/dashboard/recent-transactions', async (req, res) => {
  try {
    // Fetch transactions first
    const { data: transactions, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (transactionError) throw transactionError;
    
    // Fetch categories separately
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('id, name, icon, color');
    
    if (categoryError) throw categoryError;
    
    // Map categories by name for quick lookup
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat;
    });
    
    const formattedTransactions = transactions.map(transaction => ({
      ...transaction,
      category_icon: categoryMap[transaction.category]?.icon || '💰',
      category_color: categoryMap[transaction.category]?.color || '#6b7280'
    }));
    
    res.json(formattedTransactions);
  } catch (err) {
    console.error('Error fetching recent transactions:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/dashboard/category-spending', async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    // Fetch transactions first
    const { data: transactions, error: transactionError } = await supabase
      .from('transactions')
      .select('category, amount')
      .eq('type', 'expense')
      .gte('transaction_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
      .lt('transaction_date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);
    
    if (transactionError) throw transactionError;
    
    // Fetch categories separately
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('name, icon, color')
      .eq('type', 'expense');
    
    if (categoryError) throw categoryError;
    
    // Map categories by name for quick lookup
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat;
    });
    
    // Group by category and sum amounts
    const categoryTotals = transactions.reduce((acc, transaction) => {
      const category = transaction.category;
      if (!acc[category]) {
        acc[category] = {
          category,
          total: 0,
          icon: categoryMap[category]?.icon || '💰',
          color: categoryMap[category]?.color || '#6b7280'
        };
      }
      acc[category].total += parseFloat(transaction.amount);
      return acc;
    }, {});
    
    const result = Object.values(categoryTotals).sort((a, b) => b.total - a.total);
    res.json(result);
  } catch (err) {
    console.error('Error fetching category spending:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/dashboard/budget-progress', async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    // Get active budgets first
    const { data: budgets, error: budgetError } = await supabase
      .from('budgets')
      .select('*')
      .eq('status', 'active')
      .lte('start_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-28`)
      .gte('end_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
      .limit(6);
    
    if (budgetError) throw budgetError;
    
    // Get categories separately
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('id, name, icon, color');
    
    if (categoryError) throw categoryError;
    
    // Map categories by id for quick lookup
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.id] = cat;
    });
    
    // Calculate spent amounts for each budget
    const budgetProgress = await Promise.all(
      budgets.map(async (budget) => {
        const category = categoryMap[budget.category_id];
        
        const { data: transactions, error: transactionError } = await supabase
          .from('transactions')
          .select('amount')
          .eq('category', category?.name || '')
          .eq('type', 'expense')
          .gte('transaction_date', budget.start_date)
          .lte('transaction_date', budget.end_date);
        
        if (transactionError) {
          console.error('Error fetching transactions for budget:', transactionError);
        }
        
        const spent = transactions?.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0) || 0;
        const percentage = (spent / parseFloat(budget.amount)) * 100;
        
        return {
          category: category?.name || budget.name,
          icon: category?.icon || '💰',
          color: category?.color || '#6b7280',
          spent,
          budget: parseFloat(budget.amount),
          percentage: Math.round(percentage * 100) / 100,
          status: percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good'
        };
      })
    );
    
    res.json(budgetProgress);
  } catch (err) {
    console.error('Error fetching budget progress:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/dashboard/spending-trend', async (req, res) => {
  try {
    const currentDate = new Date();
    const months = [];
    
    // Get last 6 months of data
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      const { data: monthlyData, error } = await supabase
        .from('transactions')
        .select('type, amount')
        .gte('transaction_date', `${year}-${month.toString().padStart(2, '0')}-01`)
        .lt('transaction_date', `${year}-${(month + 1).toString().padStart(2, '0')}-01`);
      
      if (error) throw error;
      
      const income = monthlyData
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const expenses = monthlyData
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income,
        expenses,
        net: income - expenses
      });
    }
    
    res.json(months);
  } catch (err) {
    console.error('Error fetching spending trend:', err);
    res.status(500).json({ error: err.message });
  }
});

// Borrowers API (Personal Loan Tracker)
app.get('/api/borrowers', async (req, res) => {
  try {
    const { data: borrowers, error: borrowersError } = await supabase
      .from('borrowers')
      .select('*')
      .order('name');
    
    if (borrowersError) throw borrowersError;
    
    // Calculate totals and get transactions for each borrower
    const borrowersWithCalculations = await Promise.all(
      borrowers.map(async (borrower) => {
        const { data: transactions, error: transactionError } = await supabase
          .from('loan_transactions')
          .select('*')
          .eq('borrower_id', borrower.id)
          .order('date', { ascending: false });
        
        if (transactionError) throw transactionError;
        
        let totalLent = 0;
        let totalReceived = 0;
        let totalInterest = 0;
        
        // Calculate interest and totals
        transactions.forEach(transaction => {
          if (transaction.type === 'given') {
            totalLent += parseFloat(transaction.amount);
            // Calculate interest earned
            const startDate = new Date(transaction.date);
            const endDate = new Date();
            const daysDiff = Math.max(0, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
            const yearsDiff = daysDiff / 365;
            const interest = parseFloat(transaction.amount) * (parseFloat(transaction.interest_rate) / 100) * yearsDiff;
            transaction.interest_earned = Math.round(interest * 100) / 100;
            totalInterest += transaction.interest_earned;
          } else {
            totalReceived += parseFloat(transaction.amount);
          }
        });
        
        return {
          ...borrower,
          totalLent,
          totalReceived,
          outstanding: totalLent - totalReceived,
          totalInterest: Math.round(totalInterest * 100) / 100,
          transactions
        };
      })
    );
    
    res.json(borrowersWithCalculations);
  } catch (err) {
    console.error('Error fetching borrowers:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/borrowers', async (req, res) => {
  try {
    const { name, contact, notes } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const { data, error } = await supabase
      .from('borrowers')
      .insert([{ name, contact, notes }])
      .select();
    
    if (error) throw error;
    
    // Return borrower with empty calculations
    const borrower = {
      ...data[0],
      totalLent: 0,
      totalReceived: 0,
      outstanding: 0,
      totalInterest: 0,
      transactions: []
    };
    
    res.json(borrower);
  } catch (err) {
    console.error('Error creating borrower:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/borrowers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, notes } = req.body;
    
    const { data, error } = await supabase
      .from('borrowers')
      .update({
        name,
        contact,
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    console.error('Error updating borrower:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/borrowers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('borrowers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting borrower:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get transactions for a specific borrower
app.get('/api/borrowers/:id/transactions', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: transactions, error } = await supabase
      .from('loan_transactions')
      .select('*')
      .eq('borrower_id', id)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    // Calculate interest for each transaction
    const transactionsWithInterest = transactions.map(transaction => {
      if (transaction.type === 'given') {
        const startDate = new Date(transaction.date);
        const endDate = new Date();
        const daysDiff = Math.max(0, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
        const yearsDiff = daysDiff / 365;
        const interest = parseFloat(transaction.amount) * (parseFloat(transaction.interest_rate) / 100) * yearsDiff;
        transaction.interest_earned = Math.round(interest * 100) / 100;
      }
      return transaction;
    });
    
    res.json(transactionsWithInterest);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ error: err.message });
  }
});

// Loan Transactions API
app.post('/api/loan-transactions', async (req, res) => {
  try {
    const { borrower_id, type, amount, interest_rate, date, due_date, description } = req.body;
    
    if (!borrower_id || !type || !amount || amount <= 0 || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (interest_rate < 0) {
      return res.status(400).json({ error: 'Interest rate cannot be negative' });
    }
    
    const { data, error } = await supabase
      .from('loan_transactions')
      .insert([{
        borrower_id: parseInt(borrower_id),
        type,
        amount: parseFloat(amount),
        interest_rate: parseFloat(interest_rate),
        date,
        due_date: due_date || null,
        description: description || (type === 'given' ? 'Money Given' : 'Money Received')
      }])
      .select();
    
    if (error) throw error;
    res.json({ id: data[0].id });
  } catch (err) {
    console.error('Error creating loan transaction:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Using Supabase database only');
});