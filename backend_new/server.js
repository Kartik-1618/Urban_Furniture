const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.status(401).json({ error: 'Missing token' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) return res.status(400).json({ error: 'User not found' });
    
    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, department: user.department, must_change_password: user.must_change_password }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, department: user.department, must_change_password: user.must_change_password } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/change-password', authenticateToken, async (req, res) => {
  const { newPassword } = req.body;
  try {
    const hash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password_hash = $1, must_change_password = false WHERE id = $2', [hash, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/me', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, email, name, role, department FROM users WHERE id = $1', [req.user.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- MASTER DATA ROUTES (CRUD) ---

// Contacts
app.get('/api/contacts', authenticateToken, async (req, res) => {
  let query = 'SELECT * FROM contacts';
  if (req.user.role === 'accountant') {
    if (req.user.department === 'Sales') query += " WHERE type = 'Customer'";
    else if (req.user.department === 'Purchase') query += " WHERE type = 'Vendor'";
  }
  query += ' ORDER BY id DESC';
  const { rows } = await db.query(query);
  res.json(rows);
});

app.post('/api/contacts', authenticateToken, async (req, res) => {
  try {
    const { name, type, email, phone, city, state, pincode, profile_image } = req.body;
    const { rows } = await db.query(
      'INSERT INTO contacts (name, type, email, phone, city, state, pincode, profile_image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [name, type, email, phone, city, state, pincode, profile_image]
    );
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already registered' });
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/contacts/:id', authenticateToken, async (req, res) => {
  try {
    const { name, type, email, phone, city, state, pincode, profile_image } = req.body;
    const { rows } = await db.query(
      'UPDATE contacts SET name=$1, type=$2, email=$3, phone=$4, city=$5, state=$6, pincode=$7, profile_image=$8 WHERE id=$9 RETURNING *',
      [name, type, email, phone, city, state, pincode, profile_image, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already registered' });
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/contacts/:id', authenticateToken, async (req, res) => {
  try {
    await db.query('DELETE FROM contacts WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Products
app.get('/api/products', authenticateToken, async (req, res) => {
  const { rows } = await db.query('SELECT * FROM products ORDER BY id DESC');
  res.json(rows);
});

app.post('/api/products', authenticateToken, async (req, res) => {
  const { name, category, type, sales_price, cost_price, stock_qty } = req.body;
  const { rows } = await db.query(
    'INSERT INTO products (name, category, type, sales_price, cost_price, stock_qty) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [name, category, type, sales_price, cost_price, stock_qty]
  );
  res.json(rows[0]);
});

app.put('/api/products/:id', authenticateToken, async (req, res) => {
  const { name, category, type, sales_price, cost_price, stock_qty } = req.body;
  const { rows } = await db.query(
    'UPDATE products SET name=$1, category=$2, type=$3, sales_price=$4, cost_price=$5, stock_qty=$6 WHERE id=$7 RETURNING *',
    [name, category, type, sales_price, cost_price, stock_qty, req.params.id]
  );
  res.json(rows[0]);
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accounts
app.get('/api/accounts', authenticateToken, async (req, res) => {
  const { rows } = await db.query('SELECT * FROM accounts ORDER BY id ASC');
  res.json(rows);
});

app.post('/api/accounts', authenticateToken, async (req, res) => {
  const { name, type, balance } = req.body;
  const { rows } = await db.query(
    'INSERT INTO accounts (name, type, balance) VALUES ($1, $2, $3) RETURNING *',
    [name, type, balance]
  );
  res.json(rows[0]);
});

app.delete('/api/accounts/:id', authenticateToken, async (req, res) => {
  try {
    await db.query('DELETE FROM accounts WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Journals
app.get('/api/journals', authenticateToken, async (req, res) => {
  let query = `
    SELECT j.*, a.name as default_account_name 
    FROM journals j 
    LEFT JOIN accounts a ON j.default_account_id = a.id 
  `;
  if (req.user.role === 'accountant') {
    if (req.user.department === 'Sales') query += " WHERE j.type = 'Sales'";
    else if (req.user.department === 'Purchase') query += " WHERE j.type = 'Purchase'";
    else if (req.user.department === 'Accounts') query += " WHERE j.type = 'Bank' OR j.type = 'Cash'";
  }
  query += ' ORDER BY j.id ASC';
  const { rows } = await db.query(query);
  res.json(rows);
});

app.post('/api/journals', authenticateToken, async (req, res) => {
  const { name, type, default_account_id } = req.body;
  const { rows } = await db.query(
    'INSERT INTO journals (name, type, default_account_id) VALUES ($1, $2, $3) RETURNING *',
    [name, type, default_account_id]
  );
  res.json(rows[0]);
});

app.delete('/api/journals/:id', authenticateToken, async (req, res) => {
  try {
    await db.query('DELETE FROM journals WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Users / Accountants
app.get('/api/users', authenticateToken, async (req, res) => {
  const { rows } = await db.query("SELECT id, name, email, role, department FROM users WHERE role = 'accountant'");
  res.json(rows);
});

app.post('/api/users', authenticateToken, async (req, res) => {
  try {
    const { name, email, department } = req.body;
    const defaultPassword = 'welcome' + Math.floor(1000 + Math.random() * 9000);
    const hash = await bcrypt.hash(defaultPassword, 10);
    const { rows } = await db.query(
      "INSERT INTO users (name, email, password_hash, role, department, must_change_password) VALUES ($1, $2, $3, 'accountant', $4, true) RETURNING id, name, email, role, department",
      [name, email, hash, department || 'General']
    );
    // Send password back so frontend can show it in popup
    res.json({ ...rows[0], password: defaultPassword });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already registered' });
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { name, email, department } = req.body;
    const { rows } = await db.query(
      'UPDATE users SET name = $1, email = $2, department = $3 WHERE id = $4 RETURNING id, name, email, role, department',
      [name, email, department, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already registered' });
    res.status(500).json({ error: err.message });
  }
});
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Transactions (Journal Entries)
app.get('/api/transactions', authenticateToken, async (req, res) => {
  let query = `
    SELECT je.id, je.date, je.reference, je.status, j.name as journal_name, j.type as journal_type,
      (SELECT SUM(debit) FROM journal_items WHERE journal_entry_id = je.id) as total_debit,
      (SELECT SUM(credit) FROM journal_items WHERE journal_entry_id = je.id) as total_credit
    FROM journal_entries je
    LEFT JOIN journals j ON je.journal_id = j.id
  `;
  if (req.user.role === 'accountant') {
    if (req.user.department === 'Sales') query += " WHERE j.type = 'Sales'";
    else if (req.user.department === 'Purchase') query += " WHERE j.type = 'Purchase'";
    else if (req.user.department === 'Accounts') query += " WHERE j.type IN ('Bank', 'Cash')";
  }
  query += ' ORDER BY je.id DESC';
  const { rows } = await db.query(query);
  res.json(rows);
});

app.post('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const { date, reference, journal_id, status } = req.body;
    const { rows } = await db.query(
      'INSERT INTO journal_entries (date, reference, status, journal_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [date || new Date(), reference, status || 'Draft', journal_id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard Stats
app.get('/api/dashboard-stats', authenticateToken, async (req, res) => {
  try {
    const { rows: salesAll } = await db.query("SELECT COUNT(*) FROM journal_entries je JOIN journals j ON je.journal_id = j.id WHERE j.type = 'Sales'");
    const { rows: salesConfirmed } = await db.query("SELECT COUNT(*) FROM journal_entries je JOIN journals j ON je.journal_id = j.id WHERE j.type = 'Sales' AND je.status = 'Confirmed'");
    const { rows: salesDraft } = await db.query("SELECT COUNT(*) FROM journal_entries je JOIN journals j ON je.journal_id = j.id WHERE j.type = 'Sales' AND je.status = 'Draft'");

    const { rows: purchAll } = await db.query("SELECT COUNT(*) FROM journal_entries je JOIN journals j ON je.journal_id = j.id WHERE j.type = 'Purchase'");
    const { rows: purchConfirmed } = await db.query("SELECT COUNT(*) FROM journal_entries je JOIN journals j ON je.journal_id = j.id WHERE j.type = 'Purchase' AND je.status = 'Confirmed'");
    const { rows: purchDraft } = await db.query("SELECT COUNT(*) FROM journal_entries je JOIN journals j ON je.journal_id = j.id WHERE j.type = 'Purchase' AND je.status = 'Draft'");

    res.json({
      sales: {
        all: parseInt(salesAll[0].count),
        confirmed: parseInt(salesConfirmed[0].count),
        draft: parseInt(salesDraft[0].count)
      },
      purchase: {
        all: parseInt(purchAll[0].count),
        confirmed: parseInt(purchConfirmed[0].count),
        draft: parseInt(purchDraft[0].count)
      },
      budget: {
        achieved: 3,
        budget: 2,
        committed: 4
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
