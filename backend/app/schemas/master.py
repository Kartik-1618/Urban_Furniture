from pydantic import BaseModel, EmailStr
from typing import Optional, Any
from app.models.master import ContactTypeEnum, AccountTypeEnum, JournalTypeEnum

# -- Contact Schemas --
class ContactBase(BaseModel):
    name: str
    type: ContactTypeEnum
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    gstin_tax_id: Optional[str] = None

class ContactCreate(ContactBase):
    pass

class ContactUpdate(ContactBase):
    pass

class ContactSchema(ContactBase):
    id: int
    user_id: Optional[int] = None
    class Config:
        from_attributes = True

# -- Product Schemas --
class ProductBase(BaseModel):
    sku: str
    name: str
    category: Optional[str] = None
    sales_price: float = 0
    purchase_cost: float = 0
    tax_rate: float = 0
    stock_qty: int = 0
    reorder_level: int = 0
    hsn_code: Optional[str] = None
    unit: str = "pcs"
    meta_data: Optional[Any] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class ProductSchema(ProductBase):
    id: int
    class Config:
        from_attributes = True

# -- Chart of Account Schemas --
class ChartOfAccountBase(BaseModel):
    code: str
    name: str
    type: AccountTypeEnum
    parent_id: Optional[int] = None

class ChartOfAccountCreate(ChartOfAccountBase):
    pass

class ChartOfAccountUpdate(ChartOfAccountBase):
    pass

class ChartOfAccountSchema(ChartOfAccountBase):
    id: int
    class Config:
        from_attributes = True

# -- Journal Schemas --
class JournalBase(BaseModel):
    name: str
    type: JournalTypeEnum

class JournalCreate(JournalBase):
    pass

class JournalUpdate(JournalBase):
    pass

class JournalSchema(JournalBase):
    id: int
    class Config:
        from_attributes = True
