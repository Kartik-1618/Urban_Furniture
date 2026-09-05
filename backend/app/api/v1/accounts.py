from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.models.master import ChartOfAccount
from app.models.user import User
from app.schemas.master import ChartOfAccountSchema

router = APIRouter()

@router.get("/", response_model=List[ChartOfAccountSchema])
def read_accounts(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    accounts = db.query(ChartOfAccount).all()
    return accounts
