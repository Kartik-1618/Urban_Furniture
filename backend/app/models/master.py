from sqlalchemy import Column, Integer, String, Numeric, Enum, ForeignKey, JSON
import enum
from app.db.base_class import Base

class ContactTypeEnum(str, enum.Enum):
    customer = "customer"
    vendor = "vendor"
    both = "both"

class Contact(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    type = Column(Enum(ContactTypeEnum), nullable=False)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    address = Column(String)
    gstin_tax_id = Column(String)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=True) # Optional portal login link

class Product(Base):
    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, index=True, nullable=False)
    category = Column(String)
    sales_price = Column(Numeric(14, 2), nullable=False, default=0)
    purchase_cost = Column(Numeric(14, 2), nullable=False, default=0)
    tax_rate = Column(Numeric(5, 2), nullable=False, default=0)
    stock_qty = Column(Integer, default=0)
    reorder_level = Column(Integer, default=0)
    hsn_code = Column(String)
    unit = Column(String, default="pcs")
    meta_data = Column(JSON, nullable=True)

class AccountTypeEnum(str, enum.Enum):
    asset = "asset"
    liability = "liability"
    equity = "equity"
    income = "income"
    expense = "expense"

class ChartOfAccount(Base):
    __tablename__ = "chart_of_accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    type = Column(Enum(AccountTypeEnum), nullable=False)
    parent_id = Column(Integer, ForeignKey("chart_of_accounts.id"), nullable=True)

class JournalTypeEnum(str, enum.Enum):
    sales = "sales"
    purchase = "purchase"
    cash = "cash"
    bank = "bank"
    general = "general"

class Journal(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(Enum(JournalTypeEnum), nullable=False)
