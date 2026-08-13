import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router
from app.websocket.handler import router as ws_router

@asynccontextmanager
async def lifespan(app):
    print(r"""
     _____             _      _____             _   _     _ 
    |_   _|           | |    /  ___|           | | | |   (_)
      | | _ __ __ _ __| | ___\ `--.  __ _  __ _| |_| |__  _ 
      | || '__/ _` / _` |/ _ \`--. \/ _` |/ _` | __| '_ \| |
      | || | | (_| \ (_| |  __/\__/ / (_| | (_| | |_| | | | |
      \_/|_|  \__,_|\__,_|\___\____/ \__,_|\__,_|\__|_| |_|_|
                                                             
    TradeSaathi JARVIS Trading Companion Backend initialized.
    """)
    yield

app = FastAPI(title="TradeSaathi JARVIS Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")
app.include_router(ws_router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000)

