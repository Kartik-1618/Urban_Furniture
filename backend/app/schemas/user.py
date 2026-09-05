from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models.user import RoleEnum

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    role: RoleEnum = RoleEnum.customer
    is_active: bool = True

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str

# Properties to receive via API on update
class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: Optional[int] = None

    class Config:
        from_attributes = True

# Additional properties to return via API
class User(UserInDBBase):
    pass
