# Import all the models, so that Base has them before being imported by Alembic
from app.db.base_class import Base

# We will import models here later as we create them
from app.models.user import User 
from app.models.master import Contact, Product, ChartOfAccount, Journal
