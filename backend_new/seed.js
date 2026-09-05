const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function initDB() {
  // 1. Connect to default postgres to create the new database
  const rootPool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'postgres',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    console.log("Checking if database exists...");
    const res = await rootPool.query(`SELECT 1 FROM pg_database WHERE datname='${process.env.DB_NAME}'`);
    if (res.rowCount === 0) {
      console.log(`Creating database ${process.env.DB_NAME}...`);
      await rootPool.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log("Database created.");
    } else {
      console.log("Database already exists.");
    }
  } catch (err) {
    console.error("Error creating database:", err);
  } finally {
    await rootPool.end();
  }

  // 2. Connect to the newly created database to create tables and seed data
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    console.log("Creating tables...");
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user'
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(100)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        sku VARCHAR(100) UNIQUE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        sales_price NUMERIC(10, 2) DEFAULT 0,
        cost_price NUMERIC(10, 2) DEFAULT 0,
        stock_qty INTEGER DEFAULT 0
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        balance NUMERIC(15, 2) DEFAULT 0
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS journals (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL
      );
    `);

    console.log("Tables created successfully.");

    console.log("Seeding data...");

    // Seed Admin
    const adminCheck = await pool.query(`SELECT 1 FROM users WHERE email='admin@example.com'`);
    if (adminCheck.rowCount === 0) {
      const hash = await bcrypt.hash('admin123', 10);
      await pool.query(
        `INSERT INTO users (email, name, password_hash, role) VALUES ($1, $2, $3, $4)`,
        ['admin@example.com', 'Admin User', hash, 'admin']
      );
    }

    // Seed Contacts
    const contactCheck = await pool.query(`SELECT 1 FROM contacts LIMIT 1`);
    if (contactCheck.rowCount === 0) {
      await pool.query(`
        INSERT INTO contacts (name, type, email, phone) VALUES 
        ('Aarav Sharma', 'customer', 'aarav@sharma.in', '+91 98765 43210'),
        ('Kavita Nair', 'customer', 'kavita@gmail.com', '+91 91234 56789'),
        ('Century Plyboards India Ltd', 'vendor', 'sales@centuryply.com', '+91 33 3940 3950'),
        ('Greenply Industries', 'vendor', 'info@greenply.com', '+91 11 4279 1399');
      `);
    }

    // Seed Products
    const prodCheck = await pool.query(`SELECT 1 FROM products LIMIT 1`);
    if (prodCheck.rowCount === 0) {
      await pool.query(`
        INSERT INTO products (sku, name, type, sales_price, cost_price, stock_qty) VALUES 
        ('FUR-001', 'Teak Wood Dining Table (6 Seater)', 'goods', 35000, 22000, 15),
        ('FUR-002', 'Ergonomic Office Chair', 'goods', 8500, 5000, 40),
        ('SRV-001', 'Interior Design Consultation', 'service', 5000, 0, 0);
      `);
    }

    // Seed Accounts
    const accCheck = await pool.query(`SELECT 1 FROM accounts LIMIT 1`);
    if (accCheck.rowCount === 0) {
      await pool.query(`
        INSERT INTO accounts (code, name, type, balance) VALUES 
        ('1000', 'HDFC Bank Current A/c', 'asset', 2500000),
        ('1100', 'Accounts Receivable', 'asset', 150000),
        ('2000', 'Accounts Payable', 'liability', 500000),
        ('2100', 'CGST Payable', 'liability', 0),
        ('2101', 'SGST Payable', 'liability', 0),
        ('3000', 'Owner Capital', 'capital', 5000000),
        ('4000', 'Sales - Furniture', 'income', 0),
        ('5000', 'Purchases - Raw Materials', 'expense', 0);
      `);
    }

    // Seed Journals
    const journalCheck = await pool.query(`SELECT 1 FROM journals LIMIT 1`);
    if (journalCheck.rowCount === 0) {
      await pool.query(`
        INSERT INTO journals (name, type) VALUES 
        ('Customer Invoices', 'sale'),
        ('Vendor Bills', 'purchase'),
        ('Bank Operations', 'bank'),
        ('Cash Operations', 'cash');
      `);
    }

    console.log("Seeding complete!");

  } catch (err) {
    console.error("Error setting up DB:", err);
  } finally {
    await pool.end();
  }
}

initDB();
