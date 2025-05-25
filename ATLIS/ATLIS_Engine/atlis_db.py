'''

ATLIS (Abhay Tripathi LinkedIn Syncer) Engine Database Manager.

Not for use outisde Manipal Group.

© Abhay Tripathi, B.Tech in Computer Science and Engineering (CSE) from 2021 to 2025, Manipal University Jaipur
  (Registration Number: 219301226).

'''

from conf import DB_HOST, DB_USER, DB_PASS, DB_NAME, DATA_TABLE, CONTROL_TABLE, SH_TABLE, UPDATION_PERIOD

import mysql.connector
import time
import ast

class ATLISDB:

    __db_instance = None
    __db_cursor = None

    def __init__(self):
        self.__db_instance = mysql.connector.connect(
            host = DB_HOST,
            user = DB_USER,
            password = DB_PASS,
            database = DB_NAME,
            auth_plugin = "mysql_native_password"
        )
        self.__db_cursor = self.__db_instance.cursor()

    def update_sh_data(self, li_url: str, sh_id: str):
        try:
            self.__db_cursor.execute(f"""INSERT INTO {SH_TABLE} VALUES(%s, %s);""", (li_url, sh_id,))
        except Exception as db_error:
            if "duplicate" in str(db_error).lower():
                self.__db_cursor.execute(f"""UPDATE {SH_TABLE} SET sh_id = %s WHERE li_url = %s;""", (sh_id, li_url,))
            else:
                raise db_error
        finally:
            self.__db_instance.commit()

    def get_sh_data(self, li_url: str) -> int:
        self.__db_cursor.execute(f"""SELECT sh_id FROM {SH_TABLE} WHERE li_url = %s;""", (li_url,))
        sh_id_data = self.__db_cursor.fetchone()
        if sh_id_data == [] or sh_id_data is None:
            return None
        return str(sh_id_data[0])
    
    def update_data(self, li_data: dict, li_url: str):
        try:
            self.__db_cursor.execute(f"""INSERT INTO {CONTROL_TABLE} VALUES(%s, UNIX_TIMESTAMP(), UNIX_TIMESTAMP() + %s, "N", 0, 0);""", (li_url, UPDATION_PERIOD,))
        except Exception as db_error:
            if "duplicate" in str(db_error).lower():
                self.__db_cursor.execute(f"""UPDATE {CONTROL_TABLE} SET previous_update_time = UNIX_TIMESTAMP(), scheduled_update_time = UNIX_TIMESTAMP() + %s, processing = "N", consecutive_data_fails = 0 WHERE li_url = %s;""", (UPDATION_PERIOD, li_url,))
            else:
                raise db_error
        muj_program = li_data[li_url]["muj_program"]
        muj_from = li_data[li_url]["muj_from"]
        muj_to = li_data[li_url]["muj_to"]
        company_name = li_data[li_url]["company_name"]
        current_designation = li_data[li_url]["designation"]
        previous_experience = str(li_data[li_url]["experience"])
        other_education = str(li_data[li_url]["education"])
        country = li_data[li_url]["country"]
        location = li_data[li_url]["location"]
        try:
            self.__db_cursor.execute(f"""INSERT INTO {DATA_TABLE} VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);""", (li_url, muj_program, muj_from, muj_to, company_name, current_designation, previous_experience, other_education, country, location,))
        except Exception as db_error:
            if "duplicate" in str(db_error).lower():
                self.__db_cursor.execute(f"""UPDATE {DATA_TABLE} SET muj_program = %s, muj_from = %s, muj_to = %s, company_name = %s, current_designation = %s, previous_experience = %s, other_education = %s, country = %s, location = %s WHERE li_url = %s;""", (muj_program, muj_from, muj_to, company_name, current_designation, previous_experience, other_education, country, location, li_url,))
            else:
                raise db_error
        self.__db_instance.commit()

    def update_data_failure(self, li_url: str):
        try:
            self.__db_cursor.execute(f"""INSERT INTO {CONTROL_TABLE} VALUES(%s, NULL, NULL, "N", 1, 1);""", (li_url,))
        except Exception as db_error:
            if "duplicate" in str(db_error).lower():
                self.__db_cursor.execute(f"""UPDATE {CONTROL_TABLE} SET consecutive_data_fails = consecutive_data_fails + 1, data_fails = data_fails + 1 WHERE li_url = %s;""", (li_url,))
            else:
                raise db_error
        self.__db_instance.commit()

    def get_data_from_db(self, li_url: str) -> dict:
        self.__db_cursor.execute(f"""SELECT scheduled_update_time FROM {CONTROL_TABLE} WHERE li_url = %s;""", (li_url,))
        li_control_data = self.__db_cursor.fetchone()
        if li_control_data == [] or li_control_data is None or li_control_data[0] is None or int(li_control_data[0]) < int(time.time()):
            return None
        self.__db_cursor.execute(f"""SELECT muj_program, muj_from, muj_to, company_name, current_designation, previous_experience, other_education, country, location FROM {DATA_TABLE} WHERE li_url = %s;""", (li_url,))
        li_profile_data = self.__db_cursor.fetchone()
        if li_profile_data == [] or li_profile_data is None:
            return None
        return {
            li_url: {
                "muj_program": li_profile_data[0],
                "muj_from": li_profile_data[1],
                "muj_to": li_profile_data[2],
                "muj_valid": "Y",
                "company_name": li_profile_data[3],
                "designation": li_profile_data[4],
                "experience": ast.literal_eval(li_profile_data[5]),
                "education": ast.literal_eval(li_profile_data[6]),
                "country": li_profile_data[7],
                "location": li_profile_data[8]
            }
        }

    def get_consecutive_data_fails(self, li_url: str) -> int:
        self.__db_cursor.execute(f"""SELECT consecutive_data_fails FROM {CONTROL_TABLE} WHERE li_url = %s;""", (li_url,))
        li_control_data = self.__db_cursor.fetchone()
        if li_control_data == [] or li_control_data is None:
            return -1
        return int(li_control_data[0])