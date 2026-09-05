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

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/me', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, email, name, role FROM users WHERE id = $1', [req.user.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- MASTER DATA ROUTES (CRUD) ---

// Contacts
app.get('/api/contacts', authenticateToken, async (req, res) => {
  const { rows } = await db.query('SELECT * FROM contacts ORDER BY id DESC');
  res.json(rows);
});

app.post('/api/contacts', authenticateToken, async (req, res) => {
  const { name, type, email, phone, city, state, pincode, profile_image } = req.body;
  const { rows } = await db.query(
    'INSERT INTO contacts (name, type, email, phone, city, state, pincode, profile_image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
    [name, type, email, phone, city, state, pincode, profile_image]
  );
  res.json(rows[0]);
});

app.delete('/api/contacts/:id', authenticateToken, async (req, res) => {
  await db.query('DELETE FROM contacts WHERE id = $1', [req.params.id]);
  res.json({ message: 'Deleted' });
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

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  await db.query('DELETE FROM products WHERE id = $1', [req.params.id]);
  res.json({ message: 'Deleted' });
});

// Accounts
app.get('/api/accounts', authenticateToken, async (req, res) => {
  const { rows } = await db.query('SELECT * FROM accounts ORDER BY code ASC');
  res.json(rows);
});

app.post('/api/accounts', authenticateToken, async (req, res) => {
  const { code, name, type, balance } = req.body;
  const { rows } = await db.query(
    'INSERT INTO accounts (code, name, type, balance) VALUES ($1, $2, $3, $4) RETURNING *',
    [code, name, type, balance]
  );
  res.json(rows[0]);
});

app.delete('/api/accounts/:id', authenticateToken, async (req, res) => {
  await db.query('DELETE FROM accounts WHERE id = $1', [req.params.id]);
  res.json({ message: 'Deleted' });
});

// Journals
app.get('/api/journals', authenticateToken, async (req, res) => {
  const { rows } = await db.query(`
    SELECT j.*, a.name as default_account_name 
    FROM journals j 
    LEFT JOIN accounts a ON j.default_account_id = a.id 
    ORDER BY j.id ASC
  `);
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
  await db.query('DELETE FROM journals WHERE id = $1', [req.params.id]);
  res.json({ message: 'Deleted' });
});

// Users / Accountants
app.get('/api/users', authenticateToken, async (req, res) => {
  const { rows } = await db.query("SELECT id, name, email, role FROM users WHERE role = 'accountant'");
  res.json(rows);
});

app.post('/api/users', authenticateToken, async (req, res) => {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await db.query(
    "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'accountant') RETURNING id, name, email, role",
    [name, email, hash]
  );
  res.json(rows[0]);
});

// Transactions (Journal Entries)
app.get('/api/transactions', authenticateToken, async (req, res) => {
  const { rows } = await db.query(`
    SELECT je.id, je.date, je.reference, j.name as journal_name,
      (SELECT SUM(debit) FROM journal_items WHERE journal_entry_id = je.id) as total_debit,
      (SELECT SUM(credit) FROM journal_items WHERE journal_entry_id = je.id) as total_credit
    FROM journal_entries je
    LEFT JOIN journals j ON je.journal_id = j.id
    ORDER BY je.id DESC
  `);
  res.json(rows);
});

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
