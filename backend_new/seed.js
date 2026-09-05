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
        role VARCHAR(50) DEFAULT 'user',
        must_change_password BOOLEAN DEFAULT false
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
      `INSERT INTO users (email, name, password_hash, role, must_change_password) VALUES ($1, $2, $3, $4, false), ($5, $6, $7, $8, true)`,
      ['jetha123@mail.com', 'JethaLal Gada', hash, 'admin', 'accountant@yopmail.com', 'Accountant User', hash, 'accountant']
    );

    await pool.query(`
      INSERT INTO contacts (name, type, email, phone, city, state, pincode) VALUES 
      ('Aarav Sharma', 'Customer', 'aarav@sharma.in', '+91 98765 43210', 'Mumbai', 'Maharashtra', '400001'),
      ('Kavita Nair', 'Customer', 'kavita@gmail.com', '+91 91234 56789', 'Bengaluru', 'Karnataka', '560001'),
      ('Nimesh Pathak', 'Customer', 'nimesh.p@example.com', '+91 99887 76655', 'Ahmedabad', 'Gujarat', '300015'),
      ('Century Plyboards India Ltd', 'Vendor', 'sales@centuryply.com', '+91 33 3940 3950', 'Kolkata', 'West Bengal', '700001'),
      ('Greenply Industries', 'Vendor', 'info@greenply.com', '+91 11 4279 1399', 'New Delhi', 'Delhi', '110001'),
      ('Azure Furniture', 'Vendor', 'contact@azure.in', '+91 88776 65544', 'Pune', 'Maharashtra', '411001');
    `);

    await pool.query(`
      INSERT INTO products (name, category, type, sales_price, cost_price, stock_qty) VALUES 
      ('Ergonomic Office Chair', 'Chairs', 'Goods', 8500, 5000, 40),
      ('Wooden Chair', 'Chairs', 'Goods', 4500, 2800, 120),
      ('L-Shaped Fabric Sofa', 'Sofas', 'Goods', 45000, 28000, 10),
      ('3-Seater Leather Sofa', 'Sofas', 'Goods', 55000, 32000, 8),
      ('Minimalist Coffee Table', 'Tables', 'Goods', 12000, 6000, 25),
      ('Glass Dining Table', 'Tables', 'Goods', 25000, 15000, 15),
      ('King Size Bed Frame', 'Beds', 'Goods', 35000, 20000, 12),
      ('Queen Size Mattress', 'Beds', 'Goods', 18000, 10000, 30),
      ('Bookshelf 5-Tier', 'Storage', 'Goods', 9500, 5000, 50),
      ('Wooden Wardrobe', 'Storage', 'Goods', 28000, 16000, 20),
      ('TV Unit Stand', 'Living', 'Goods', 15000, 8000, 18),
      ('Nightstand Table', 'Bedroom', 'Goods', 4500, 2000, 60),
      ('Executive Desk', 'Office', 'Goods', 22000, 12000, 15),
      ('Mesh Desk Chair', 'Office', 'Goods', 6500, 3500, 45),
      ('Round Dining Table', 'Tables', 'Goods', 18000, 10000, 22),
      ('Velvet Accent Chair', 'Chairs', 'Goods', 12500, 7000, 30),
      ('Wooden Bunk Bed', 'Beds', 'Goods', 42000, 25000, 5),
      ('Shoe Rack', 'Storage', 'Goods', 3500, 1500, 80),
      ('Console Table', 'Living', 'Goods', 11000, 5500, 25),
      ('Interior Design Consultation', 'Services', 'Service', 5000, 0, 0),
      ('Furniture Assembly Service', 'Services', 'Service', 1500, 0, 0)
    `);

    const accRes = await pool.query(`
      INSERT INTO accounts (name, type, balance) VALUES 
      ('HDFC Bank Current A/c', 'Asset', 2500000),
      ('Accounts Receivable (Debtors)', 'Asset', 150000),
      ('Accounts Payable (Creditors)', 'Liability', 500000),
      ('CGST Payable', 'Liability', 0),
      ('SGST Payable', 'Liability', 0),
      ('Owner Capital', 'Capital', 5000000),
      ('Sales Income', 'Income', 0),
      ('Purchases Expense', 'Expense', 0)
      RETURNING id, name;
    `);

    const getAccId = (name) => accRes.rows.find(a => a.name === name)?.id;

    const journalRes = await pool.query(`
      INSERT INTO journals (name, type, default_account_id) VALUES 
      ('Customer Invoices', 'Sales', $1),
      ('Vendor Bills', 'Purchase', $2),
      ('Bank Operations', 'Bank', $3)
      RETURNING id, name;
    `, [getAccId('Sales Income'), getAccId('Purchases Expense'), getAccId('HDFC Bank Current A/c')]);

    const getJournalId = (name) => journalRes.rows.find(j => j.name === name)?.id;
    const salesJournalId = getJournalId('Customer Invoices');
    const purchaseJournalId = getJournalId('Vendor Bills');
    const bankJournalId = getJournalId('Bank Operations');
    const debtorAcc = getAccId('Accounts Receivable (Debtors)');
    const creditorAcc = getAccId('Accounts Payable (Creditors)');
    const salesAcc = getAccId('Sales Income');
    const purchaseAcc = getAccId('Purchases Expense');

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
