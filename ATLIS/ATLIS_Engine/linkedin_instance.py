'''

ATLIS (Abhay Tripathi LinkedIn Syncer) Profile Data Operations Manager (External).

Not for use outisde Manipal Group.

© Abhay Tripathi, B.Tech in Computer Science and Engineering (CSE) from 2021 to 2025, Manipal University Jaipur
  (Registration Number: 219301226).

'''

import asyncio
import json
import websockets

from atlis_db import ATLISDB
from websockets.exceptions import ConnectionClosed

class LinkedInInstance:

    __atlis_db = None
    
    def __init__(self, atlis_logger, host="0.0.0.0", port=3009, secret_code="!@#$s9606219ce012e34ae0b1ef02091fd271ecb429bc3bcb4884f06563e65a2c8b99!@#$%"):
        self.host = host
        self.port = port
        self.secret_code = secret_code
        self.connected_client = None
        self.server = None
        self.response_event = asyncio.Event()
        self.received_message = None
        self.__atlis_db = ATLISDB()
        self.atlis_logger = atlis_logger
        self.loop = asyncio.new_event_loop()

    async def handler(self, websocket):
        try:
            first_message = await websocket.recv()
            if first_message != self.secret_code:
                await websocket.close()
                return
            
            self.connected_client = websocket
            self.atlis_logger.lprint("Client connected with correct secret code.")

            async for message in websocket:
                self.received_message = message
                # self.response_event.set()
                self.loop.call_soon_threadsafe(self.response_event.set)

        except ConnectionClosed:
            self.atlis_logger.lprint("Client disconnected.")
            self.connected_client = None
            self.loop.call_soon_threadsafe(self.response_event.set)
            # self.response_event.set()
            self.atlis_logger.lprint("Connection closed.")

    async def _async_get_data(self, url):
        
        if not self.connected_client:
            return {
                url: {
                    "error": "dc"
                }
            }
        
        try:
            sh_id = self.__atlis_db.get_sh_data(url)
            if sh_id is not None:
                await self.connected_client.send(url + "[%ATLISDS%]" + sh_id)
            else:
                await self.connected_client.send(url)
            
            await self.response_event.wait()
            self.response_event.clear()
            
            if self.received_message:
                response = json.loads(self.received_message)
                if url in response:
                    if "sh_id" in response[url]:
                        recvd_sh_id = response[url]["sh_id"]
                        self.__atlis_db.update_sh_data(url, recvd_sh_id)
                    self.received_message = None
                    return response
            
        except (ConnectionClosed, json.JSONDecodeError):
            pass

        return {
            url: {
                "error": "dc"
            }
        }

    def get_data(self, url):
        return self.loop.run_until_complete(self._async_get_data(url))

    async def start_server(self):
        self.server = await websockets.serve(self.handler, self.host, self.port)
        self.atlis_logger.lprint(f"Server started on {self.host}:{self.port}")
        await self.server.wait_closed()

    def run(self):
        asyncio.run(self.start_server())