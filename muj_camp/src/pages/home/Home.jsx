import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/css/Common.css";
import "../../assets/css/Home.css";

import homeImage from "../../assets/images/home.png";
import homeVideo from "../../assets/videos/home.webm";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import Login from "./Login";
import { validateSession } from "../../tools/Auth";
import { showAlert } from "../../tools/UI";
import ManipalBar from "../../custom_components/ManipalBar";
import { setSessionRole } from "../../app_state/auth/auth_actions";
import { AuthStore } from "../../app_state/auth/auth";

const Home = () => {

    const [isLoginLoading, setIsLoginLoading] = useState(true);

    useEffect(() => {
        AuthStore.dispatch(setSessionRole(null));
        validateSession((sessionExisted) => {
            if (sessionExisted) {
                showAlert("Session expired! Please login again.", toast.error, false);
            }
            setIsLoginLoading(false);
        },
        () => {
            setIsLoginLoading(false);
        }, true);
    }, []);

    return (
        <>
            <video
                autoPlay
                muted
                loop
                className="home-video"
                preload = "none"
                poster = {homeImage}
            >
                <source
                    src = {homeVideo}
                    type = "video/webm"
                />
            </video>
            <ManipalBar />
            <div className="home-background" />
            <Login isLoginLoading={isLoginLoading} />
        </>
    );
}

export { Home };