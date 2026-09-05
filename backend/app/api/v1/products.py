from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.master import Product
from app.models.user import User
from app.schemas.master import ProductSchema, ProductCreate, ProductUpdate

router = APIRouter()

@router.get("/", response_model=List[ProductSchema])
def read_products(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user)
):
    products = db.query(Product).offset(skip).limit(limit).all()
    return products

@router.post("/", response_model=ProductSchema)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if current_user.role == "customer":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if db.query(Product).filter(Product.sku == product_in.sku).first():
        raise HTTPException(status_code=409, detail="A product with this SKU already exists.")
        
    product = Product(**product_in.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.patch("/{product_id}", response_model=ProductSchema)
def update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if current_user.role == "customer":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
        
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if current_user.role == "customer":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    # TODO: Check references
    db.delete(product)
    db.commit()
    return {"ok": True}
