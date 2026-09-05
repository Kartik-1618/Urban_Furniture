Product Requirements Document (PRD)
Urban Furniture Accounting System
Version: 1.0
Date: October 26, 2023
Author: [Your Team Name]
Status: Draft

1. Project Overview
The Urban Furniture Accounting System is a comprehensive financial management application designed for a furniture retail business. It aims to digitalize the entire accounting workflow, from master data management to complex financial reporting.

The system provides an integrated platform for managing contacts, products, financial accounts, and transactions, ensuring that all financial records adhere to double-entry accounting principles. The ultimate goal is to provide a real-time view of the company's financial health through automated reports.

2. Objectives & Goals
Streamline Operations: Move from manual or spreadsheet-based accounting to a digital, integrated system.

Ensure Accuracy: Automate debit/credit postings, tax calculations, and ledger updates to minimize human error.

Provide Real-time Insights: Generate the Balance Sheet, Profit & Loss (P&L), and Budget reports instantly.

Multi-Role Accessibility: Facilitate secure access for Admins, Accountants, and Customers, each with specific permissions.

Maintain Data Integrity: Ensure that all transactions are linked and traceable from Master Data to Journal Entries and Reports.

3. User Personas & Actors
3.1 Admin (Business Owner)
Capabilities: Full system access.

Responsibilities:

Create and manage all Master Data (Contacts, Products, Chart of Accounts).

Record transactions (Purchases, Sales).

View and analyze all financial reports.

Archive outdated data.

3.2 Invoicing User (Accountant)
Capabilities: Financial and transactional access.

Responsibilities:

Create Master Data (primarily Chart of Accounts & Journals).

Record financial transactions and journal entries.

Handle ledger management and account reconciliation.

Generate reports for management.

3.3 Contact (Customer/Vendor)
Capabilities: Limited, isolated access.

Responsibilities:

View their own invoices and bills.

Make payments against their outstanding amounts.

3.4 System
Type: Automated Background Service.

Capabilities:

Validates data integrity (e.g., debit = credit).

Computes taxes on transactions.

Automatically updates General Ledger accounts.

Generates reports based on stored data.

4. Functional Modules & Workflows
The system is divided into three core areas: Master Data, Transactions, and Reporting.

Module 1: Master Data Management
This is the foundation of the system. All subsequent transactions reference this data.

1.1 Contact Master
Purpose: Stores information for all entities the company interacts with (Customers, Vendors).

Fields: ID, Name, Type (Customer, Vendor, Both), Email, Mobile, Address (City, State, Pincode), Profile Image.

Connection: Used in Sales Orders (Customer) and Purchase Orders (Vendor).

1.2 Product Master
Purpose: Catalog of items sold or services rendered.

Fields: ID, Product Name, Type (Goods, Service, Combo), Sales Price, Cost (Purchase Price), Category.

Connection: Used as line items in Sales Orders and Purchase Orders.

1.3 Chart of Accounts (CoA) Master
Purpose: Defines the "buckets" where every financial transaction is classified (e.g., Cash, Bank, Sales Income).

Fields: Account ID, Account Name, Type (Asset, Liability, Expense, Income, Capital).

Connection: Essential for creating Journal Entries. Every transaction must map to accounts defined here.

1.4 Journal Master
Purpose: Categorizes transactions based on their nature (e.g., Sales, Purchases).

Fields: Journal ID, Journal Name, Type (Sales, Purchase, Bank, Cash), Default Accounts.

Connection: Acts as a container for "Journal Entries."

Module 2: Transaction Flow
This is where the day-to-day business activities are recorded.

2.1 Purchase Cycle (Vendor)
Purchase Order (PO): Created for a specific Vendor (Contact Master). Select Products (Product Master) and quantities.

Vendor Bill: Convert the PO to a Bill. This registers the liability (Accounts Payable) and records the Purchase Expense (Chart of Accounts).

Payment: Register payment against the Bill. Select the payment method (Cash or Bank) and record the amount. This reduces the Accounts Payable liability.

2.2 Sales Cycle (Customer)
Sales Order (SO): Created for a specific Customer (Contact Master). Select Products (Product Master), quantities, and tax.

Customer Invoice: Generate Invoice from SO. This registers the receivable (Accounts Receivable) and recognizes Sales Income (Chart of Accounts).

Receipt: Record the payment received against the Invoice. Select Cash or Bank.

2.3 Manual Journal Entry
Purpose: For adjustments, depreciation, or any transaction not covered by Sales/Purchase cycles.

Function: Directly create a Journal Entry by selecting Debit and Credit accounts from the Chart of Accounts and specifying the amount.

Module 3: Budget & Analytics
3.1 Analytic Account
Purpose: A marker to group expenses/income by project, department, or segment (e.g., "Store A," "Online Store").

Fields: Analytic Account Name, Type (Income/Expenses).

3.2 Budget
Purpose: A financial plan outlining expected income and expenses for a specific analytic account.

Fields: Budget Name, Period, Responsible Person, Planned Amount.

5. User Flows & System Interactions
Flow 1: Sales Process
Actor: Accountant/Admin

Action: Navigates to "Sales" -> "New Sales Order."

System: Lists available Customers (from Contact Master).

Actor: Selects Customer, Adds Products (from Product Master), Sets Quantity.

System: Calculates Total Price (Quantity * Sales Price) + Tax.

Actor: Converts SO to "Customer Invoice."

System:

Creates a Journal Entry (Debit: Accounts Receivable, Credit: Sales Income).

Updates the Customer's Ledger.

Actor: Receives payment and records "Receipt" against the Invoice.

System:

Creates a Journal Entry (Debit: Cash/Bank, Credit: Accounts Receivable).

Updates General Ledger.

Flow 2: Purchase Process
Actor: Accountant/Admin

Action: Navigates to "Purchases" -> "New Purchase Order."

Actor: Selects Vendor (from Contact Master), Adds Products, Quantity.

Action: Converts PO to "Vendor Bill."

System:

Creates a Journal Entry (Debit: Purchase Expense, Credit: Accounts Payable).

Updates Vendor's Ledger.

Actor: Records payment against the Bill.

System:

Creates a Journal Entry (Debit: Accounts Payable, Credit: Cash/Bank).

Updates General Ledger.

Flow 3: Reporting
Actor: Admin/Accountant

Action: Navigates to "Reports" and selects "Balance Sheet."

System: Aggregates all Ledger Account balances from the Chart of Accounts.

System: Displays the Balance Sheet format showing Assets = Liabilities + Equity.

Actor: Selects "Budget Report."

System: Compares the "Planned Amount" from the Budget Module with the "Actual Income/Expenses" from the General Ledger.

6. Non-Functional Requirements (NFRs)
Security:

Role-Based Access Control (RBAC).

Secure authentication (Login/Logout).

Customers should only see their own data.

Performance:

Reports should generate in less than 3 seconds for 1 year of data.

Invoice generation should be instant.

Data Integrity:

The system must enforce the double-entry rule (Total Debits = Total Credits).

No accidental deletion of Master Data if it is used in a transaction (Foreign Key constraints).

Usability:

Intuitive UI for non-technical users (Accountants).

The mockup design should be closely followed.

7. Technical Data Model (Entity Relationship)
The connection between modules can be visualized as follows:

Contact is linked to Sales Order (Customer) and Purchase Order (Vendor).

Product is linked to Sales Order Items and Purchase Order Items.

Sales Order generates Customer Invoice.

Purchase Order generates Vendor Bill.

Invoice/Bill and Payments generate Journal Entries.

Journal Entries consist of Journal Items (Debit/Credit) that reference the Chart of Accounts.

Journal Entries are grouped by Journal (e.g., Sales Journal).

Budget is linked to Analytic Accounts to track performance against the plan.

8. Milestones & Deliverables
Phase 1: Setup Master Data modules (Contacts, Products, CoA).

Phase 2: Implement Purchase Cycle (PO -> Bill -> Payment).

Phase 3: Implement Sales Cycle (SO -> Invoice -> Receipt).

Phase 4: Implement Reporting (Balance Sheet, P&L).

Phase 5: Integrate Budgeting and Analytics.

9. Glossary
CoA: Chart of Accounts.

P&L: Profit and Loss Statement.

SO: Sales Order.

PO: Purchase Order.

Journal Entry: A record of a debit/credit transaction.

Analytic Account: A cost center for tracking specific projects or departments.

10. Appendix
Mockup Link: https://app.excalidraw.com/s/65VNwvy7c4X/6ofCsWuwe