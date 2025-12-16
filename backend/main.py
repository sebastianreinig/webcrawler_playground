from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import crawler
import json
from models import CrawlerConfig

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/ws/crawl")
async def websocket_crawl(websocket: WebSocket):
    await websocket.accept()
    try:
        data = await websocket.receive_text()
        request_data = json.loads(data)
        
        # Parse config securely
        try:
            config = CrawlerConfig(**request_data)
        except Exception as validation_error:
            await websocket.send_json({"type": "error", "message": f"Config Error: {validation_error}"})
            await websocket.close()
            return
            
        async def progress_callback(msg):
            await websocket.send_json(msg)
            
        results = await crawler.crawl(config, progress_callback)
        await websocket.send_json({"type": "complete", "data": results})
        await websocket.close()
            
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"Error: {e}")
        try:
             await websocket.send_json({"type": "error", "message": str(e)})
             await websocket.close()
        except:
            pass

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Recursive Crawler Backend Ready"}
