import asyncio
import json
import websockets
import time

from atlis_logger import ATLISLogger
from linkedin_instance import LinkedInInstance

class WebSocketClient:
    def __init__(self, uri, linkedin_instance, reconnect_delay=1):
        self.uri = uri
        self.linkedin_instance = linkedin_instance
        self.reconnect_delay = reconnect_delay

    async def connect(self):
        while True:
            try:
                async with websockets.connect(self.uri) as websocket:
                    print("Connected to WebSocket server.")
                    
                    await websocket.send(f"!@#$s9606219ce012e34ae0b1ef02091fd271ecb429bc3bcb4884f06563e65a2c8b99!@#$%")
                    print("Sent secret code to WebSocket server.")

                    await self.listen_and_process(websocket)

            except websockets.ConnectionClosed as e:
                print(f"Connection closed with error: {e}. Attempting to reconnect in {self.reconnect_delay} seconds...")
                time.sleep(self.reconnect_delay)

    async def listen_and_process(self, websocket):
        while True:
            try:
                message = await websocket.recv()
                print(f"Received message from server: {message}")

                response_data = self.process_linkedin_url(message)

                await websocket.send(json.dumps(response_data))
                print(f"Sent response data back to server: {response_data}")

            except Exception:
                print("Connection lost, attempting to reconnect...")
                break

    def process_linkedin_url(self, li_url):
        if "[%ATLISDS%]" in li_url:
            sh_id = str(li_url.split("[%ATLISDS%]")[1])
            actual_url = str(li_url.split("[%ATLISDS%]")[0])
            linkedin_data = self.linkedin_instance.get_data(actual_url, account_number=1, prev_shid=sh_id)
        else:
            linkedin_data = self.linkedin_instance.get_data(li_url)
        return linkedin_data

linkedin_instance = LinkedInInstance(ATLISLogger())

uri = "wss://camp.muj.swayamlabs.com/ws/admin"
# uri = "ws://localhost:3009" # Change before production.

ws_client = WebSocketClient(uri, linkedin_instance)

while True:
    try:
        asyncio.get_event_loop().run_until_complete(ws_client.connect())
    except KeyboardInterrupt:
        break
    except:
        pass