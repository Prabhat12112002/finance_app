import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database import Base, engine
from app.routers import auth, users, transactions, dashboard
from app.config import settings

# Create all tables on startup (for development; production uses migrations)
if settings.APP_ENV == "development":
    Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Finance Data Processing API",
    description="Backend API for the Finance Dashboard with role-based access control.",
    version="1.0.0",
)

# Configure CORS for both local and production
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    settings.FRONTEND_URL,
]
# Add Vercel preview URLs pattern
if os.environ.get("VERCEL_URL"):
    allowed_origins.append(f"https://{os.environ.get('VERCEL_URL')}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(transactions.router)
app.include_router(dashboard.router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Finance Data Processing API is running"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
