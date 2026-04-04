from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse


from app.database import Base, engine
from app.routers import auth, users, transactions, dashboard

# TEMPORARY: Run seed.py on startup to seed the production database
import subprocess
import os
if os.environ.get("RUN_SEED_ON_STARTUP", "1") == "1":
    try:
        subprocess.run(["python", "seed.py"], cwd=os.path.dirname(os.path.dirname(__file__)), check=True)
    except Exception as e:
        print(f"[WARNING] Could not run seed.py: {e}")

# Create all tables on startup (for development; use Alembic for production)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Finance Data Processing API",
    description="Backend API for the Finance Dashboard with role-based access control.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
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
