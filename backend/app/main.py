from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Urban Furniture Accounting System",
    description="Backend API for the double-entry accounting system",
    version="1.0.0",
)

# Configure CORS
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.v1 import auth, contacts, products, accounts
from app.core.config import settings
import traceback
import logging
from fastapi.responses import JSONResponse
from fastapi import Request

logger = logging.getLogger(__name__)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(contacts.router, prefix=f"{settings.API_V1_STR}/contacts", tags=["contacts"])
app.include_router(products.router, prefix=f"{settings.API_V1_STR}/products", tags=["products"])
app.include_router(accounts.router, prefix=f"{settings.API_V1_STR}/accounts", tags=["accounts"])

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong, please try again"},
    )

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Urban Furniture API is running."}
