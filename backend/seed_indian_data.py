import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.user import User, RoleEnum
from app.models.master import Contact, Product, ChartOfAccount
from app.core.security import get_password_hash

def seed():
    # 1. Create tables
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 2. Create Admin User
        admin_email = "admin@example.com"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                email=admin_email,
                name="Admin User",
                password_hash=get_password_hash("Admin@123"),
                role=RoleEnum.admin,
                is_active=True,
            )
            db.add(admin)
            print("Admin user created.")
        
        # 3. Seed Chart of Accounts (Indian Context)
        if db.query(ChartOfAccount).count() == 0:
            accounts = [
                ChartOfAccount(code="1000", name="HDFC Bank Current A/c", type="asset", balance=2500000.0),
                ChartOfAccount(code="1010", name="SBI Cash Credit A/c", type="asset", balance=850000.0),
                ChartOfAccount(code="1100", name="Accounts Receivable (Sundry Debtors)", type="asset", balance=150000.0),
                ChartOfAccount(code="2000", name="Accounts Payable (Sundry Creditors)", type="liability", balance=500000.0),
                ChartOfAccount(code="2100", name="CGST Payable", type="liability", balance=0.0),
                ChartOfAccount(code="2101", name="SGST Payable", type="liability", balance=0.0),
                ChartOfAccount(code="2102", name="IGST Payable", type="liability", balance=0.0),
                ChartOfAccount(code="3000", name="Owner's Capital", type="capital", balance=5000000.0),
                ChartOfAccount(code="4000", name="Sales - Furniture", type="income", balance=0.0),
                ChartOfAccount(code="4010", name="Sales - Interior Services", type="income", balance=0.0),
                ChartOfAccount(code="5000", name="Purchases - Raw Materials", type="expense", balance=0.0),
                ChartOfAccount(code="5100", name="Rent Expense", type="expense", balance=0.0),
            ]
            db.add_all(accounts)
            print("Chart of Accounts seeded.")

        # 4. Seed Products
        if db.query(Product).count() == 0:
            products = [
                Product(sku="FUR-001", name="Teak Wood Dining Table (6 Seater)", type="goods", sales_price=35000.0, cost_price=22000.0, stock_qty=15),
                Product(sku="FUR-002", name="Ergonomic Office Chair", type="goods", sales_price=8500.0, cost_price=5000.0, stock_qty=40),
                Product(sku="FUR-003", name="L-Shaped Fabric Sofa", type="goods", sales_price=45000.0, cost_price=28000.0, stock_qty=10),
                Product(sku="SRV-001", name="Interior Design Consultation", type="service", sales_price=5000.0, cost_price=0.0, stock_qty=0),
            ]
            db.add_all(products)
            print("Products seeded.")

        # 5. Seed Contacts
        if db.query(Contact).count() == 0:
            contacts = [
                Contact(name="Aarav Sharma", type="customer", email="aarav@sharma.in", phone="+91 98765 43210"),
                Contact(name="Kavita Nair", type="customer", email="kavita.nair@gmail.com", phone="+91 91234 56789"),
                Contact(name="Century Plyboards India Ltd", type="vendor", email="sales@centuryply.com", phone="+91 33 3940 3950"),
                Contact(name="Greenply Industries", type="vendor", email="info@greenply.com", phone="+91 11 4279 1399"),
            ]
            db.add_all(contacts)
            print("Contacts seeded.")

        db.commit()
        print("Database seeded successfully!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
