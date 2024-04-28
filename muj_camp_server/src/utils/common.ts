import { Mutex } from "async-mutex";
import { createHash } from "crypto";
import { WebSocket } from "ws";

const sha256 = (text: string) => {
    return String(createHash("sha256").update(text).digest("hex"));
}

const getSessionID = (email: string): string => {
    return String(email.toAlphaNumeric() + String(Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)));
}

const currentTime = (): number => {
    return Math.floor(new Date().getTime() / 1000);
}

const timestampToHumanTime = (timestamp: number): string => {
    const monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];

    const date = new Date(timestamp * 1000);
    const day = ("0" + date.getDate()).slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    const minutes = ("0" + date.getMinutes()).slice(-2);
    const seconds = ("0" + date.getSeconds()).slice(-2);
    const am_pm = date.getHours() >= 12 ? "PM" : "AM";
    const hour12 = date.getHours() % 12 || 12;

    let dayWithSuffix;
    switch (day) {
        case "01":
        case "21":
        case "31":
            dayWithSuffix = day + "st";
            break;
        case "02":
        case "22":
            dayWithSuffix = day + "nd";
            break;
        case "03":
        case "23":
            dayWithSuffix = day + "rd";
            break;
        default:
            dayWithSuffix = day + "th";
    }

    const formattedDate = `${dayWithSuffix} ${monthNames[parseInt(month, 10) - 1]} ${year} ${hour12}:${minutes}:${seconds} ${am_pm}`;
    return formattedDate;
}

const synchronizeCode = async (mutex: Mutex, callback: Function) => {
    await mutex
    .waitForUnlock()
    .then(() => {
        mutex
        .acquire()
        .then(async (release) => {
            try {
                await callback();
            } catch (e) {
            } finally {
                release();
            }
        })
    });
}

const sendMessageToWSClient = (wsClient: WebSocket, jsonMessage: object) => {
    if (wsClient == null) {
        return;
    }
    try {
        wsClient.send(JSON.stringify(jsonMessage));
    } catch (e) {
    }
}

const specialHash = (string1: string, string2: string): string => {
    return (string1 + string2).replaceAll(" ", "");
} 

export { sha256, getSessionID, currentTime, timestampToHumanTime, synchronizeCode, sendMessageToWSClient, specialHash };