import successTune from "../assets/audio/success.mp3";
import errorTune from "../assets/audio/error.mp3";

import { alert, confirm } from "react-bootstrap-confirmation";
import { toast } from "react-toastify";

import { AuthStore } from "../app_state/auth/auth";
import { revokeSessionAccess } from "../app_state/auth/auth_actions";

const playSound = (soundCode) => {
    let sound = null;
    if (soundCode === "s") {
        sound = successTune;
    } else if (soundCode === "e") {
        sound = errorTune;
    } else {
        return;
    }
    new Audio(sound).play();
}

const showAlert = (message, messageTypeCallback = toast.success, sound = true) => {
    if (message[message.length - 1] === ".") {
        message = message.substring(0, message.length - 1);
    }
    if (sound === true) {
        if (messageTypeCallback === toast.success) {
            playSound("s");
        } else if (messageTypeCallback === toast.error) {
            playSound("e");
        }
    }
    messageTypeCallback(message, {
        position: "top-right",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        progress: undefined
    });
}

const confirmLogout = async (navigate, onCancel = null) => {
    if (await confirm(`Are you sure you want to leave, ${AuthStore.getState().authName} 🤨`, {
        title: "Are you sure?",
        okText: "Yes 😎",
        cancelText: "No pressed by mistake 😅",
        okButtonStyle: "danger",
        cancelButtonStyle: "warning"
    })) {
        showAlert(`Ok bye bye, ${AuthStore.getState().authName} 👋`);
        AuthStore.dispatch(revokeSessionAccess());
        navigate("/");
    } else {
        if (onCancel != null) {
            onCancel();
        }
    }
}

const showCredits = async () => {
    await alert((
        <>
            Designed and Developed solely by:<br/>
            <b>Abhay Tripathi (B.Tech CSE 2021 to 2025)</b>
            <br/><br/>
            © {new Date().getUTCFullYear()} Manipal University Jaipur (MUJ)<br/>
            © {new Date().getUTCFullYear()} Manipal University Jaipur Alumni Association (MUJAA)<br/>
            © {new Date().getUTCFullYear()} Software Development Center (SDC), Department of Computer Science and Engineering, Manipal University Jaipur (MUJ)<br/>
            © {new Date().getUTCFullYear()} Abhay Tripathi, B.Tech CSE (2021 to 2025), Manipal University Jaipur (MUJ)
        </>), {
        okText: "Got it 👍",
        okButtonStyle: "success"
    });
}

const timestampToHumanTime = (timestamp) => {
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
};

const moneyFormatIndia = (num) => {
    let explrestunits = "";
    if (num.length > 3) {
        let lastthree = num.substring(num.length - 3);
        let restunits = num.substring(0, num.length - 3);
        restunits = (restunits.length % 2 === 1) ? "0" + restunits : restunits;
        let expunit = restunits.match(/.{1,2}/g);
        for (let i = 0; i < expunit.length; i++) {
            if (i === 0) {
                explrestunits += parseInt(expunit[i], 10) + ",";
            } else {
                explrestunits += expunit[i] + ",";
            }
        }
        let thecash = explrestunits + lastthree;
        return thecash;
    } else {
        return num;
    }
}

const scrollHorizontallyTo = (element) => {
    const elementRight = element.offsetLeft + element.offsetWidth;
    const elementLeft = element.offsetLeft;

    const elementParentRight = element.parentNode.offsetLeft + element.parentNode.offsetWidth;
    const elementParentLeft = element.parentNode.offsetLeft;

    if (elementRight > elementParentRight + element.parentNode.scrollLeft) {
        element.parentNode.scrollLeft = elementRight - elementParentRight;
    } else if (elementLeft < elementParentLeft + element.parentNode.scrollLeft) {
        element.parentNode.scrollLeft = elementLeft - elementParentLeft;
    }
}

export { playSound, showAlert, confirmLogout, showCredits, timestampToHumanTime, moneyFormatIndia, scrollHorizontallyTo };