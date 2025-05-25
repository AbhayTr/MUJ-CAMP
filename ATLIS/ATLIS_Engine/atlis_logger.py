'''

ATLIS (Abhay Tripathi LinkedIn Syncer) Engine Logger.

Not for use outisde Manipal Group.

© Abhay Tripathi, B.Tech in Computer Science and Engineering (CSE) from 2021 to 2025, Manipal University Jaipur
  (Registration Number: 219301226).

'''

from collections import deque
from conf import LOG_FILE, ALERT_HOST, ALERT_PORT, ALERT_MAIL, ALERT_PWD, ALERT_TO
from email.mime.text import MIMEText as text

import datetime
import time
import threading
import os
import smtplib

class ATLISLogger:

    __log_file = None
    __log_mail = None
    __thread_lock = None
    __email_lock = None
    __alert_mail = None

    def __init__(self):
        self.__log_file = open(LOG_FILE, "a")
        self.__thread_lock = threading.Lock()
        self.__email_lock = threading.Lock()
        # try:
        #     self.__alert_mail = smtplib.SMTP(ALERT_HOST, ALERT_PORT)
        #     self.__alert_mail.ehlo()
        #     self.__alert_mail.starttls()
        #     self.__alert_mail.login(ALERT_MAIL, ALERT_PWD)
        #     self.lprint("Mail Service is live.")
        # except:
        #     self.__alert_mail = None
        #     self.lprint("Mail Service failed to connect.")

    def __alert(self, msg):
        with self.__email_lock:
            if self.__alert_mail is None:
                return
            try:
                self.__alert_mail.ehlo()
                self.__alert_mail.starttls()
                self.__alert_mail.login(ALERT_MAIL, ALERT_PWD)
            except:
                pass
            body = f"""
            [ALERT FROM ATLIS Engine]

            {msg}

            Regards,
            Abhay Tripathi
            ATLIS
            """

            alert_message = text(body)
            alert_message["Subject"] = "ALERT MESSAGE from ATLIS Engine"
            alert_message["From"] = ALERT_MAIL
            alert_message["To"] = ALERT_TO
            self.__alert_mail.sendmail(ALERT_MAIL, ALERT_TO, alert_message.as_string())
            time.sleep(3)

    def lprint(self, msg, alert: bool = False):
        with self.__thread_lock:
            msg = {
                "message": str(msg),
                "alert": alert
            }
            message = f"{str(datetime.datetime.now())}: {msg['message']}"
            print(message)
            if os.path.getsize(LOG_FILE) > 52428800:
                self.__log_file.truncate(0)
                self.__log_file.flush()
            self.__log_file.write(message + "\n")
            self.__log_file.flush()
            if msg["alert"] == True:
                if "invalid li profile id" in msg["message"].lower() or "profile is not associated with muj" in msg["message"].lower() or "link not found" in msg["message"].lower() or "profile locked" in msg["message"].lower():
                    return
                try:
                    mail_thread = threading.Thread(target = self.__alert, args = (message,))
                    mail_thread.setDaemon(True)
                    mail_thread.start()
                except Exception as mail_error:
                    self.lprint(f"Error in Mail Service: '{mail_error}'.")