from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.config import settings
import logging
from app.db.base import Base, engine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# List your allowed origins exactly as they appear
origins = [
    "https://mocktrade.vercel.app",
    "http://localhost",
    "http://localhost:5173",  # Vite's default port
]

# Add the CORS middleware BEFORE including any routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow only these origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
def init_db():
    logger.info("Creating database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise e

# Initialize the database on startup
@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting application with DATABASE_URL: {settings.DATABASE_URL}")
    init_db()

# Include the API router AFTER adding the middleware
app.include_router(api_router, prefix=settings.API_V1_STR)
