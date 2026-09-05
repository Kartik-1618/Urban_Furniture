from sqlalchemy import Boolean, Column, Integer, String, Enum
import enum

from app.db.base_class import Base

class RoleEnum(str, enum.Enum):
    admin = "admin"
    accountant = "accountant"
    sales_user = "sales_user"
    customer = "customer"

class User(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.customer, nullable=False)
    is_active = Column(Boolean, default=True)
