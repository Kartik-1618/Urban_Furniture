import os
import sys

# Append the backend directory to sys.path so 'app' can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.user import User, RoleEnum
from app.core.security import get_password_hash
from app.db.base import Base
from app.db.session import engine

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        admin_user = User(
            email="admin@example.com",
            name="Admin User",
            password_hash=get_password_hash("Admin@123"),
            role=RoleEnum.admin,
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        print("Admin user created (admin@example.com / Admin@123)")
    else:
        print("Admin user already exists")
        
    db.close()

if __name__ == "__main__":
    init_db()
