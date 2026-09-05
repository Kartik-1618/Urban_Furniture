const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function initDB() {
  const rootPool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'postgres',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    const res = await rootPool.query(`SELECT 1 FROM pg_database WHERE datname='${process.env.DB_NAME}'`);
    if (res.rowCount === 0) {
      await rootPool.query(`CREATE DATABASE ${process.env.DB_NAME}`);
    }
  } catch (err) {
    console.error("Error creating database:", err);
  } finally {
    await rootPool.end();
  }

  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    console.log("Dropping existing tables...");
    await pool.query(`DROP TABLE IF EXISTS journal_items, journal_entries, journals, accounts, products, contacts, users CASCADE;`);

    console.log("Creating tables with new schema...");
    
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user'
      );
    `);

    // Removed journal_entries and journal_items from here

    // Added city, state, pincode, profile_image
    await pool.query(`
      CREATE TABLE contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(100),
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(20),
        profile_image VARCHAR(255)
      );
    `);

    // Added category, removed sku
    await pool.query(`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        type VARCHAR(50) NOT NULL,
        sales_price NUMERIC(10, 2) DEFAULT 0,
        cost_price NUMERIC(10, 2) DEFAULT 0,
        stock_qty INTEGER DEFAULT 0
      );
    `);

    await pool.query(`
      CREATE TABLE accounts (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        balance NUMERIC(15, 2) DEFAULT 0
      );
    `);
    
    // Added default_account_id
    await pool.query(`
      CREATE TABLE journals (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        default_account_id INTEGER REFERENCES accounts(id)
      );
    `);

    await pool.query(`
      CREATE TABLE journal_entries (
        id SERIAL PRIMARY KEY,
        date DATE DEFAULT CURRENT_DATE,
        reference VARCHAR(255),
        journal_id INTEGER REFERENCES journals(id) ON DELETE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE journal_items (
        id SERIAL PRIMARY KEY,
        journal_entry_id INTEGER REFERENCES journal_entries(id) ON DELETE CASCADE,
        account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
        debit NUMERIC(15, 2) DEFAULT 0,
        credit NUMERIC(15, 2) DEFAULT 0
      );
    `);

    console.log("Seeding Indian Context Data...");

    const hash = await bcrypt.hash('admin123', 10);
    await pool.query(
      `INSERT INTO users (email, name, password_hash, role) VALUES ($1, $2, $3, $4), ($5, $6, $7, $8)`,
      ['admin@example.com', 'Admin User', hash, 'admin', 'accountant@yopmail.com', 'Accountant User', hash, 'accountant']
    );

    await pool.query(`
      INSERT INTO contacts (name, type, email, phone, city, state, pincode) VALUES 
      ('Aarav Sharma', 'Customer', 'aarav@sharma.in', '+91 98765 43210', 'Mumbai', 'Maharashtra', '400001'),
      ('Kavita Nair', 'Customer', 'kavita@gmail.com', '+91 91234 56789', 'Bengaluru', 'Karnataka', '560001'),
      ('Nimesh Pathak', 'Customer', 'nimesh.p@example.com', '+91 99887 76655', 'Ahmedabad', 'Gujarat', '380015'),
      ('Century Plyboards India Ltd', 'Vendor', 'sales@centuryply.com', '+91 33 3940 3950', 'Kolkata', 'West Bengal', '700001'),
      ('Greenply Industries', 'Vendor', 'info@greenply.com', '+91 11 4279 1399', 'New Delhi', 'Delhi', '110001'),
      ('Azure Furniture', 'Vendor', 'contact@azure.in', '+91 88776 65544', 'Pune', 'Maharashtra', '411001');
    `);

    await pool.query(`
      INSERT INTO products (name, category, type, sales_price, cost_price, stock_qty) VALUES 
      ('Teak Wood Dining Table (6 Seater)', 'Tables', 'Goods', 35000, 22000, 15),
      ('Ergonomic Office Chair', 'Chairs', 'Goods', 8500, 5000, 40),
      ('Wooden Chair', 'Chairs', 'Goods', 4500, 2800, 120),
      ('L-Shaped Fabric Sofa', 'Sofas', 'Goods', 45000, 28000, 10),
      ('Interior Design Consultation', 'Services', 'Service', 5000, 0, 0);
    `);

    const accRes = await pool.query(`
      INSERT INTO accounts (code, name, type, balance) VALUES 
      ('1000', 'HDFC Bank Current A/c', 'Asset', 2500000),
      ('1100', 'Accounts Receivable (Debtors)', 'Asset', 150000),
      ('2000', 'Accounts Payable (Creditors)', 'Liability', 500000),
      ('2100', 'CGST Payable', 'Liability', 0),
      ('2101', 'SGST Payable', 'Liability', 0),
      ('3000', 'Owner Capital', 'Capital', 5000000),
      ('4000', 'Sales Income', 'Income', 0),
      ('5000', 'Purchases Expense', 'Expense', 0)
      RETURNING id, code;
    `);

    const getAccId = (code) => accRes.rows.find(a => a.code === code)?.id;

    const journalRes = await pool.query(`
      INSERT INTO journals (name, type, default_account_id) VALUES 
      ('Customer Invoices', 'Sales', $1),
      ('Vendor Bills', 'Purchase', $2),
      ('Bank Operations', 'Bank', $3)
      RETURNING id, name;
    `, [getAccId('4000'), getAccId('5000'), getAccId('1000')]);

    const getJournalId = (name) => journalRes.rows.find(j => j.name === name)?.id;
    const salesJournalId = getJournalId('Customer Invoices');
    const purchaseJournalId = getJournalId('Vendor Bills');
    const bankJournalId = getJournalId('Bank Operations');
    const bankAcc = getAccId('1000');
    const debtorAcc = getAccId('1100');
    const creditorAcc = getAccId('2000');
    const salesAcc = getAccId('4000');
    const purchaseAcc = getAccId('5000');

    // Seed 10 Deals (Journal Entries)
    for (let i = 1; i <= 5; i++) {
        // Sales Invoices
        const salesEntry = await pool.query(
            'INSERT INTO journal_entries (date, reference, journal_id) VALUES ($1, $2, $3) RETURNING id',
            [new Date(), `INV-2023-${100+i}`, salesJournalId]
        );
        const sEntryId = salesEntry.rows[0].id;
        const amount = 45000 + (i*1000);
        // Debit Debtor, Credit Sales
        await pool.query('INSERT INTO journal_items (journal_entry_id, account_id, debit, credit) VALUES ($1, $2, $3, $4), ($1, $5, $6, $7)',
            [sEntryId, debtorAcc, amount, 0, salesAcc, 0, amount]);

        // Purchase Bills
        const purchEntry = await pool.query(
            'INSERT INTO journal_entries (date, reference, journal_id) VALUES ($1, $2, $3) RETURNING id',
            [new Date(), `BILL-2023-${100+i}`, purchaseJournalId]
        );
        const pEntryId = purchEntry.rows[0].id;
        const pAmount = 28000 + (i*1000);
        // Debit Purchase, Credit Creditor
        await pool.query('INSERT INTO journal_items (journal_entry_id, account_id, debit, credit) VALUES ($1, $2, $3, $4), ($1, $5, $6, $7)',
            [pEntryId, purchaseAcc, pAmount, 0, creditorAcc, 0, pAmount]);
    }

    console.log("Database perfectly seeded!");

  } catch (err) {
    console.error("Error setting up DB:", err);
  } finally {
    await pool.end();
  }
}

initDB();
