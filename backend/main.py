from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from routes.socket import socket_router

app = FastAPI()

app.include_router(socket_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# add a rule for the index page.
@app.get("/")
def home():
    time = datetime.now().strftime("%H:%M:%S")
    return {"status": "success", "msg": "Hello from Pongo!", "time": time}



@app.get("/_ah/warmup")
def home():
    return {"status": "success"}

