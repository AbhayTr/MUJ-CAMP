'''

ATLIS (Abhay Tripathi LinkedIn Syncer) Profile Data Operations Manager.

Not for use outisde Manipal Group.

© Abhay Tripathi, B.Tech in Computer Science and Engineering (CSE) from 2021 to 2025, Manipal University Jaipur
  (Registration Number: 219301226).

'''

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium import webdriver

import os
import json
import requests
import time, random
import undetected_chromedriver as uc
import subprocess

class LinkedInInstance:

    __cookies_file = "cookies.txt"
    __cookie_string = ""

    __countries_list = [
        "afghanistan", "albania", "algeria", "andorra", "angola", "antigua and barbuda", "argentina", "armenia", "australia",
        "austria", "azerbaijan", "bahamas", "bahrain", "bangladesh", "barbados", "belarus", "belgium", "belize", "benin",
        "bhutan", "bolivia", "bosnia and herzegovina", "botswana", "brazil", "brunei", "bulgaria", "burkina faso",
        "burundi", "cabo verde", "cambodia", "cameroon", "canada", "central african republic", "chad", "chile", "china",
        "colombia", "comoros", "congo (brazzaville)", "congo (kinshasa)", "costa rica", "cote d'ivoire", "croatia", "cuba",
        "cyprus", "czechia", "denmark", "djibouti", "dominica", "dominican republic", "east timor", "ecuador", "egypt",
        "el salvador", "equatorial guinea", "eritrea", "estonia", "eswatini", "ethiopia", "fiji", "finland", "france",
        "gabon", "gambia", "georgia", "germany", "ghana", "greece", "grenada", "guatemala", "guinea", "guinea-bissau",
        "guyana", "haiti", "honduras", "hungary", "iceland", "india", "indonesia", "iran", "iraq", "ireland", "israel",
        "italy", "jamaica", "japan", "jordan", "kazakhstan", "kenya", "kiribati", "korea, north", "korea, south",
        "kosovo", "kuwait", "kyrgyzstan", "laos", "latvia", "lebanon", "lesotho", "liberia", "libya", "liechtenstein",
        "lithuania", "luxembourg", "macedonia", "madagascar", "malawi", "malaysia", "maldives", "mali", "malta",
        "marshall islands", "mauritania", "mauritius", "mexico", "micronesia", "moldova", "monaco", "mongolia",
        "montenegro", "morocco", "mozambique", "myanmar", "namibia", "nauru", "nepal", "netherlands", "new zealand",
        "nicaragua", "niger", "nigeria", "north macedonia", "norway", "oman", "palau", "palestine state",
        "panama", "papua new guinea", "paraguay", "peru", "philippines", "poland", "portugal", "qatar", "romania",
        "russia", "rwanda", "saint kitts and nevis", "saint lucia", "saint vincent and the grenadines", "samoa",
        "san marino", "sao tome and principe", "saudi arabia", "senegal", "serbia", "seychelles", "sierra leone",
        "singapore", "slovakia", "slovenia", "solomon islands", "somalia", "south africa", "south sudan", "spain", "sri lanka",
        "sudan", "suriname", "sweden", "switzerland", "syria", "taiwan", "tajikistan", "tanzania", "thailand", "togo",
        "tonga", "trinidad and tobago", "tunisia", "turkey", "turkmenistan", "tuvalu", "uganda", "ukraine",
        "united arab emirates", "united kingdom", "united states of america", "uruguay", "uzbekistan", "vanuatu",
        "vatican city", "venezuela", "vietnam", "yemen", "zambia", "zimbabwe"
    ]

    __atlis_logger = None

    def __init__(self, atlis_logger):
        self.__atlis_logger = atlis_logger

    def __save_cookies_to_file(self, cookies, file_path):
        with open(file_path, "w") as file:
            json.dump(cookies, file)

    def __load_cookies_from_file(self, file_path):
        with open(file_path, "r") as file:
            return json.load(file)

    def __handle_blank_data(self, data):
        data = str(data)
        if data is None or data.replace(" ", "") == "" or data == "N.A." or data == "None" or data == "null":
            return "N.A."
        return data

    def __process_education_data(self, li_education_institution, li_education_course_name, li_education_start_date, li_education_end_date, li_data):
        li_education_institution = self.__handle_blank_data(li_education_institution)
        li_education_course_name = self.__handle_blank_data(li_education_course_name)
        li_education_start_date = self.__handle_blank_data(li_education_start_date)
        li_education_end_date = self.__handle_blank_data(li_education_end_date)
        if (("Manipal University Jaipur" in li_education_institution or "MUJ" in li_education_institution) and ("muj_valid" not in li_data)) or (("Manipal Institute" in li_education_institution) and ("muj_valid" not in li_data)) or (("Manipal University Jaipur" in li_education_institution or "MUJ" in li_education_institution) and ("mit" in li_data and li_data["mit"] == "Y")):
            if "Manipal Institute" in li_education_institution:
                li_data["mit"] = "Y"
            li_data["muj_program"] = li_education_course_name
            li_data["muj_from"] = li_education_start_date
            li_data["muj_to"] = li_education_end_date
            li_data["muj_valid"] = "Y"
            if "education" not in li_data:
                li_data["education"] = []
        else:
            try:
                li_data["education"].append({
                    "institution_name": li_education_institution,
                    "program": li_education_course_name,
                    "from": li_education_start_date,
                    "to": li_education_end_date
                })
            except KeyError:
                li_data["education"] = [{
                    "institution_name": li_education_institution,
                    "program": li_education_course_name,
                    "from": li_education_start_date,
                    "to": li_education_end_date
                }]

    def __process_experience_date(self, date, to_date = False):
        if to_date and (date is None or date == "" or date == "N.A." or date == "null"):
            return "Present"
        return str(date)

    def __process_experience_data(self, li_experience_company, li_experience_designation, li_experience_start_date, li_experience_end_date, li_data):
        li_experience_company = self.__handle_blank_data(li_experience_company)
        li_experience_designation = self.__handle_blank_data(li_experience_designation)
        li_experience_start_date = self.__handle_blank_data(li_experience_start_date)
        li_experience_end_date = self.__handle_blank_data(li_experience_end_date)
        try:
            li_data["experience"].append({
                "company_name": li_experience_company,
                "designation": li_experience_designation,
                "from": self.__process_experience_date(li_experience_start_date),
                "to": self.__process_experience_date(li_experience_end_date, to_date = True)
            })
        except KeyError:
            if li_experience_end_date is None or li_experience_end_date == "N.A.":
                li_data["experience"] = []
                li_data["designation"] = li_experience_designation
                li_data["company_name"] = li_experience_company
            else:
                li_data["experience"] = [{
                    "company_name": li_experience_company,
                    "designation": li_experience_designation,
                    "from": self.__process_experience_date(li_experience_start_date),
                    "to": self.__process_experience_date(li_experience_end_date, to_date = True)
                }]
                li_data["designation"] = "N.E."
                li_data["company_name"] = "N.E."

    def __process_location_data(self, li_location, li_data):
        li_location = self.__handle_blank_data(li_location)
        li_location_country = li_location
        li_location_parts = li_location.split(",")
        if len(li_location_parts) > 1:
            li_location_country = li_location_parts[-1].strip()
        if li_location_country.lower() not in self.__countries_list:
            li_location_country = "N.A."
        li_location_details = ",".join(li_location_parts[:-1]) if len(li_location_parts) > 1 else li_location
        li_data["country"] = li_location_country
        li_data["location"] = li_location_details

    def __get_new_cookies(self):
        # CHROME_OPTIONS = webdriver.ChromeOptions()
        # CHROME_OPTIONS.add_argument("--no-sandbox")
        print("Connecting to driver...")
        # driver = webdriver.Remote(command_executor = f"http://13.235.99.204:4444/wd/hub", options = CHROME_OPTIONS)
        driver = uc.Chrome(use_subprocess=True)
        print("Connected to driver.")
        driver.get("https://www.signalhire.com/login")

        email_input = driver.find_element(By.CSS_SELECTOR, "input[type='email']")
        email = "mowglikabhoot@gmail.com"
        for char in email:
            email_input.send_keys(char)
            time.sleep(random.randint(1, 100) / 100)

        password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        password = "Testing@1234"
        for char in password:
            password_input.send_keys(char)
            time.sleep(random.randint(1, 100) / 100)

        time.sleep(random.randint(5, 8))

        wait = WebDriverWait(driver, 10)
        submit_button = wait.until(EC.element_to_be_clickable((By.ID, "submit")))
        driver.execute_script("arguments[0].click();", submit_button)

        wait.until(EC.presence_of_element_located((By.ID, "sp-h-counter")))

        cookies = driver.get_cookies()
        self.__save_cookies_to_file(cookies, self.__cookies_file)

        self.__cookie_string = ";".join([f"{cookie['name']}={cookie['value']}" for cookie in cookies])
        driver.quit()

    def get_data(self, li_url, account_number = 1, prev_shid = None):
        self.__cookies_file = f"cookies_{account_number}.txt"
        if os.path.exists(self.__cookies_file):
            cookies = self.__load_cookies_from_file(self.__cookies_file)
            self.__cookie_string = ";".join([f"{cookie['name']}={cookie['value']}" for cookie in cookies])
            self.__atlis_logger.lprint(f"{li_url}: Using account {account_number}.")
        else:
            return {
                li_url: {
                    "error": "All accounts exhausted for today!"
                }
            }
            # self.__get_new_cookies()

        shid = ""
        if prev_shid is None:
            result = None
            try:
                result = subprocess.run(["node", "id.js", self.__cookie_string, li_url], capture_output=True, text=True, encoding="utf-8")
                output = json.loads(result.stdout.strip())
                if output["status"] != "s":
                    raise Exception("Error")
                shid = output["shid"]
            except Exception as e:
                # if not second_attempt:
                #     try:
                #         self.__get_new_cookies()
                #         return self.get_data(li_url, second_attempt = True)
                #     except Exception as x:
                #         return {
                #             "status": "f",
                #             "data": "",
                #             "error": f"Initial Error: `{e}`, New One: `{x}`, Node: `{result.stderr.strip() if result is not None else ''}`."
                #         }
                # else:
                #     return {
                #         "status": "f",
                #         "data": "",
                #         "error": f"This One: `{e}`, Node: `{result.stderr.strip() if result is not None else ''}`."
                #     }
                self.__atlis_logger.lprint(f"(SHID) Initial Error: `{e}`, Node: `{result.stderr.strip() if result is not None else ''}`.")
                return self.get_data(li_url, account_number = account_number + 1)
        else:
            print(f"Using cached sh_id '{prev_shid}'.")
            shid = prev_shid

        result = None
        try:
            result = subprocess.run(["node", "data.js", self.__cookie_string, shid], capture_output=True, text=True, encoding="utf-8")
            output = json.loads(result.stdout.strip())
            if output["status"] != "s":
                raise Exception("Error")
            
            final_data = {}
            
            #process data
            received_data = output["data"]
            # final_data = output["data"]
            for education in received_data["education"]:
                if len(education["degree"]) == 0:
                    self.__process_education_data(education["university"], "N.A.", education["startedYear"], education["endedYear"], final_data)
                else:
                    for degree in education["degree"]:
                        self.__process_education_data(education["university"], degree + " (" + education["faculty"] + ")" if education["faculty"] is not None else "", education["startedYear"], education["endedYear"], final_data)

            for experience in received_data["experience"]:
                self.__process_experience_data(experience["company"], experience["position"], experience["started"], experience["ended"], final_data)

            self.__process_location_data(received_data["locations"][0]["name"], final_data)

            final_data["sh_id"] = shid

            return {
                li_url: final_data
            }
        except Exception as e:
            # if not second_attempt:
            #     try:
            #         self.__get_new_cookies()
            #         return self.get_data(li_url, second_attempt = True)
            #     except Exception as x:
            #         return {
            #             "status": "f",
            #             "data": "",
            #             "error": f"Initial Error: `{e}`, New One: `{x}`, Node: `{result.stderr.strip() if result is not None else ''}`."
            #         }
            # else:
            #     return {
            #         "status": "f",
            #         "data": "",
            #         "error": f"This One: `{e}`, Node: `{result.stderr.strip() if result is not None else ''}`."
            #     }
            self.__atlis_logger.lprint(f"(DATA) Initial Error: `{e}`, Node: `{result.stderr.strip() if result is not None else ''}`.")
            return self.get_data(li_url, account_number = account_number + 1, prev_shid = shid)