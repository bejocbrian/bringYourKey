from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import generation

app = FastAPI(
    title="BYOK Video Generation API",
    description="Backend API for BYOK video generation platform",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(generation.router, prefix="/api", tags=["generation"])

@app.get("/")
async def root():
    return {
        "message": "BYOK Video Generation API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
