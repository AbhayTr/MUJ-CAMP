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

export { playSound, showAlert, confirmLogout, showCredits };