from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.master import Contact
from app.models.user import User
from app.schemas.master import ContactSchema, ContactCreate, ContactUpdate

router = APIRouter()

@router.get("/", response_model=List[ContactSchema])
def read_contacts(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user)
):
    # Depending on role, may restrict contacts? Usually Admin/Accountant see all.
    if current_user.role == "customer":
        return db.query(Contact).filter(Contact.email == current_user.email).all()
    contacts = db.query(Contact).offset(skip).limit(limit).all()
    return contacts

@router.post("/", response_model=ContactSchema)
def create_contact(
    contact_in: ContactCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if current_user.role == "customer":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check duplicate email
    if contact_in.email:
        existing = db.query(Contact).filter(Contact.email == contact_in.email).first()
        if existing:
            raise HTTPException(status_code=409, detail="A contact with this email already exists.")
            
    contact = Contact(**contact_in.model_dump())
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact

@router.patch("/{contact_id}", response_model=ContactSchema)
def update_contact(
    contact_id: int,
    contact_in: ContactUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if current_user.role == "customer":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
        
    update_data = contact_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(contact, field, value)
        
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact

@router.delete("/{contact_id}")
def delete_contact(
    contact_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if current_user.role == "customer":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
        
    # TODO: Check if referenced in existing transactions
    db.delete(contact)
    db.commit()
    return {"ok": True}
