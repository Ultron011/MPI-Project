from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI Study Buddy API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AI Study Buddy Backend is running"}

from routers import study, sessions
app.include_router(study.router, prefix="/api/study", tags=["study"])
app.include_router(sessions.router, prefix="/api", tags=["sessions"])
