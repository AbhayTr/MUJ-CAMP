'''

ATLIS (Abhay Tripathi LinkedIn Syncer) Engine Core.

Not for use outisde Manipal Group.

© Abhay Tripathi, B.Tech in Computer Science and Engineering (CSE) from 2021 to 2025, Manipal University Jaipur
  (Registration Number: 219301226).

'''

from atlisq_manager import ATLISQ
from atlis_logger import ATLISLogger

import os
import signal
import tornado.web
import tornado.websocket
import tornado.ioloop
import tornado.options

class ATLISEngine:

    atlis_logger = None
    atlisq = None

    def __init__(self):
        self.atlis_logger = ATLISLogger()
        self.atlisq = ATLISQ(self.atlis_logger)
        self.atlisq.start_processing()

class Application(tornado.web.Application):

    atlis_engine = None

    def __init__(self, atlis_engine: ATLISEngine):
        self.atlis_engine = atlis_engine
        handlers = [(r"/", MainHandler)]
        settings = dict(debug = True)
        atlis_engine.atlis_logger.lprint("Engine Application activated.")
        tornado.web.Application.__init__(self, handlers, **settings)

class MainHandler(tornado.websocket.WebSocketHandler):

    __client_instance = None

    def check_origin(self, origin):
        return True
    
    def open(self):
        if self.__client_instance is not None:
            self.application.atlis_engine.atlis_logger.lprint("ATLISC: Multiple Connections attempt made.")
            self.close()
            return False
        else:
            self.__client_instance = self
            self.application.atlis_engine.atlisq.update_client_instance(self.__client_instance)
            self.application.atlis_engine.atlis_logger.lprint("ATLISC: Connection established with client.")
    
    def on_close(self):
        self.__client_instance = None
        self.application.atlis_engine.atlisq.update_client_instance(self.__client_instance)
        self.application.atlis_engine.atlis_logger.lprint("ATLISC: Connection lost with client.", alert = True)

    def on_message(self, data):
        if "[%ATLIS%]" not in data:
            self.application.atlis_engine.atlis_logger.lprint(f"ATLISC: Invalid data sent: {data}.")
            self.write_message("DM")
        else:
            data_parts = data.split("[%ATLIS%]")
            li_url = data_parts[0]
            li_validate = True if data_parts[1] == 'Y' else (False if data_parts[1] == 'N' else None)
            if li_validate is None:
                self.application.atlis_engine.atlis_logger.lprint(f"ATLISC: Invalid data sent: {data}.")
                self.write_message("DM")
            self.application.atlis_engine.atlisq.fetch_profile_data(li_url, li_validate)

if __name__ == "__main__":
    pid = os.getpid()
    try:
        atlis_engine = ATLISEngine()
        atlis_engine.atlis_logger.lprint("ATLISC: Starting Engine...")
        tornado.options.parse_command_line()
        app = Application(atlis_engine)
        app.listen(3012, address = "0.0.0.0")
        atlis_engine.atlis_logger.lprint("ATLISC: ATLIS Engine running live at Port 3012.")
        tornado.ioloop.IOLoop.instance().start()
    except KeyboardInterrupt:
        try:
            os.kill(pid, signal.SIGABRT)
        except:
            os.kill(pid, signal.SIGSTOP)