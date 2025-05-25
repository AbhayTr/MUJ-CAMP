'''

ATLIS (Abhay Tripathi LinkedIn Syncer) Profile Data Operations Manager.

Not for use outisde Manipal Group.

© Abhay Tripathi, B.Tech in Computer Science and Engineering (CSE) from 2021 to 2025, Manipal University Jaipur
  (Registration Number: 219301226).

'''

from collections import deque
from conf import DATA_FILE
from linkedin_instance import LinkedInInstance
from atlis_logger import ATLISLogger
from atlis_db import ATLISDB

import csv
import threading
import time
import random
import json
import tornado.websocket
import tornado.ioloop
import tornado.options
import tornado.platform.asyncio
import asyncio

class ATLISQ:

    __atlisq_queue = None
    __li_instance = None
    __2011_2022_data = []
    __atlis_logger = None
    __atlis_db = None
    __client_instance = None
    __manager_thread = None

    def __init__(self, atlis_logger: ATLISLogger):
        self.__atlisq_queue = deque()
        self.__atlis_logger = atlis_logger
        self.__atlis_db = ATLISDB()
        with open(DATA_FILE, mode = "r", encoding = "utf8") as file:
            csv_file = csv.reader(file)
            for record in csv_file:
                self.__2011_2022_data.append({
                    "name": (str(record[0]) + " " + str(record[1])).lower(),
                    "from": str(record[2]),
                    "to": str(record[3]),
                    "program": str(record[4]).lower(),
                    "reg_no": str(record[5])
                })

    def update_client_instance(self, client_instance: tornado.websocket.WebSocketHandler):
        self.__client_instance = client_instance

    def __publish_result(self, li_data: dict, li_url: str):
        self.__atlis_logger.lprint(f"{li_url}: Data processed successfully.")    
        while self.__client_instance is None:
            self.__atlis_logger.lprint(f"{li_url}: Client not connected. Waiting for client connection...", alert = True)
        self.__client_instance.write_message(json.dumps(li_data))
        self.__atlis_logger.lprint(f"{li_url}: Data sent successfully to client.")

    def __init_processing(self):
        asyncio.set_event_loop_policy(tornado.platform.asyncio.AnyThreadEventLoopPolicy())
        while True:
            if len(self.__atlisq_queue) != 0:
                li_profile = self.__atlisq_queue.popleft()
                if "[%WRONG_URL%]" in li_profile["li_url"]:
                    self.__atlis_logger.lprint(f"{li_profile['li_url']}: Wrong LI Profile.")
                    continue
                self.__atlis_logger.lprint(f"{li_profile['li_url']}: Processing LI Profile...")
                li_profile_data = self.__atlis_db.get_data_from_db(li_profile["li_url"])
                if li_profile_data is None:
                    consecutive_data_fails = self.__atlis_db.get_consecutive_data_fails(li_profile["li_url"])
                    if consecutive_data_fails < 3:
                        li_profile_data = self.__li_instance.get_data(li_profile["li_url"])
                    else:
                        li_profile_data = self.__li_instance.get_data(li_profile["li_url"])
                    if "error" in li_profile_data[li_profile["li_url"]]:
                        self.__atlis_logger.lprint(f"{li_profile['li_url']}: ERROR = '{li_profile_data[li_profile['li_url']]['error']}'", alert = True)
                        self.__atlis_db.update_data_failure(li_profile["li_url"])
                    if (("muj_valid" not in li_profile_data[li_profile["li_url"]] or li_profile_data[li_profile["li_url"]]["muj_valid"] == "N") and "error" not in li_profile_data[li_profile["li_url"]]) and (li_profile["li_validate"] == "Y"):
                        li_profile_data = {li_profile["li_url"]: {"error": "Profile is not associated with MUJ in terms of education."}}
                        self.__atlis_logger.lprint(f"{li_profile['li_url']}: ERROR = 'Profile is not associated with MUJ in terms of education.'", alert = True)
                    if "muj_valid" not in li_profile_data[li_profile["li_url"]] or li_profile_data[li_profile["li_url"]]["muj_valid"] == "N":
                        li_profile_data[li_profile["li_url"]]["muj_valid"] = "N"
                        li_profile_data[li_profile["li_url"]]["muj_program"] = "N.A."
                        li_profile_data[li_profile["li_url"]]["muj_from"] = "N.A."
                        li_profile_data[li_profile["li_url"]]["muj_to"] = "N.A."
                    if "education" not in li_profile_data[li_profile["li_url"]]:
                        li_profile_data[li_profile["li_url"]]["education"] = []
                    if "experience" not in li_profile_data[li_profile["li_url"]]:
                        li_profile_data[li_profile["li_url"]]["experience"] = []
                    if "designation" not in li_profile_data[li_profile["li_url"]]:
                        li_profile_data[li_profile["li_url"]]["designation"] = "N.A."
                    if "company_name" not in li_profile_data[li_profile["li_url"]]:
                        li_profile_data[li_profile["li_url"]]["company_name"] = "N.A."
                    if "location" not in li_profile_data[li_profile["li_url"]]:
                        li_profile_data[li_profile["li_url"]]["location"] = "N.A."
                    if "country" not in li_profile_data[li_profile["li_url"]]:
                        li_profile_data[li_profile["li_url"]]["country"] = "N.A."
                    if "error" not in li_profile_data[li_profile["li_url"]]:
                        self.__atlis_db.update_data(li_profile_data, li_profile["li_url"])
                else:
                    self.__atlis_logger.lprint(f"{li_profile['li_url']}: Data fetched from DB.")
                if li_profile["li_validate"] == True and "error" not in li_profile_data[li_profile["li_url"]]:
                    li_muj_reg_no = self.__map_with_mujaa(li_profile_data)
                    if li_muj_reg_no == "":
                        li_profile_data = {li_profile["li_url"]: {"error": "Unable to find any associated profile with MUJ."}}
                        self.__atlis_logger.lprint(f"{li_profile['li_url']}: ERROR = 'Unable to find any associated profile with MUJ.'", alert = True)
                self.__publish_result(li_profile_data, li_profile["li_url"])
                time.sleep(random.randint(4, 6))

    def fetch_profile_data(self, li_url: str, li_validate: bool = False):
        if "[%WRONG_URL%]" in li_url:
            return
        self.__atlisq_queue.append({
            "li_url": li_url,
            "li_validate": li_validate
        })

    def start_processing(self):
        self.__li_instance = LinkedInInstance(self.__atlis_logger)
        self.__li_manager_thread = threading.Thread(target = self.__li_instance.run)
        self.__li_manager_thread.setDaemon(True)
        self.__li_manager_thread.start()
        self.__manager_thread = threading.Thread(target = self.__init_processing)
        self.__manager_thread.setDaemon(True)
        self.__manager_thread.start()