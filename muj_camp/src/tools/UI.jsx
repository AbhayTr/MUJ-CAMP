import successTune from "../assets/audio/success.mp3";
import errorTune from "../assets/audio/error.mp3";

import { confirm } from "react-bootstrap-confirmation";
import { toast } from "react-toastify";

import { AuthStore } from "../app_state/auth/auth";

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

const confirmLogout = async () => {
    return await confirm(`Are you sure you want to leave, ${AuthStore.getState().authName} 🤨`, {
        title: "Confrim Logout",
        okText: "Yes 😎",
        cancelText: "No pressed by mistake 😅",
        okButtonStyle: "danger",
        cancelButtonStyle: "warning"
    });
}

export { playSound, showAlert, confirmLogout };