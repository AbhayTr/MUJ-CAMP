/* eslint-disable react-hooks/exhaustive-deps */

import "../../assets/css/Student.css";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { TypeAnimation } from "react-type-animation";

import { AuthStore } from "../../app_state/auth/auth";
import ManipalBar from "../../custom_components/ManipalBar";
import { validateSession } from "../../tools/Auth";
import { showAlert } from "../../tools/UI";
import { isAuthorized } from "../../tools/Rights";
import { useEffect, useState } from "react";
import { AuthPages } from "../../constants/roles";

const Home = () => {

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    useEffect(() => {

        validateSession((sessionExisted) => {
            if (sessionExisted) {
                showAlert("Session expired! Please login again.", toast.error, false);
            } else {
                showAlert("Please sign-in to continue.", toast.info, false);
            }
            navigate(`${process.env.REACT_APP_PATH_ROOT}/`);
        }, () => {
            if (AuthStore.getState().authRole == null) {
                showAlert("Please select how you want to use the app first", toast.info, false);
                navigate(`${process.env.REACT_APP_PATH_ROOT}/`);
                return;
            }
            if (!isAuthorized(AuthPages.STUDENT)) {
                showAlert("You are not authorized to access this page.", toast.error, false);
                navigate(`${process.env.REACT_APP_PATH_ROOT}/`);
            } else {
                setLoading(false);
            }
        });
    }, []);

    return (
        <div className="student-main">
            <div className="signup-space">
                <div className="signup-stars"></div>
                <div className="signup-stars"></div>
                <div className="signup-stars"></div>
                <div className="signup-stars"></div>
                <div className="signup-stars"></div>
                <div className="signup-stars"></div>
            </div>
            <div className="student-home">
                <ManipalBar type={1}/>
                <div className="home-container">
                    {(loading) ? (
                        <>
                            <h1>Please wait...</h1>
                        </>
                    ) : (
                        <>
                            <h1 className="student-home-heading">
                                <TypeAnimation
                                    sequence={[
                                        0,
                                        'Hey '
                                    ]}
                                    speed={10}
                                    cursor={false}
                                    repeat={Infinity}
                                />
                                <TypeAnimation
                                    sequence={[
                                        250,
                                        AuthStore.getState().authName
                                    ]}
                                    speed={10}
                                    repeat={Infinity}
                                    className="muj-camp-heading"
                                    cursor={false}
                                />
                                <TypeAnimation
                                    sequence={[
                                        1585,
                                        ' 👋'
                                    ]}
                                    speed={10}
                                    repeat={Infinity}
                                />
                            </h1>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export { Home };