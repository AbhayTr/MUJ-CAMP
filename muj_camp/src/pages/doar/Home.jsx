/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { validateSession } from "../../tools/Auth";
import { AuthPages } from "../../constants/roles";
import { showAlert } from "../../tools/UI";
import isAuthorized from "../../tools/Rights";

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
            navigate("/");
        }, () => {
            if (!isAuthorized(AuthPages.DOAR)) {
                showAlert("You are not authorized to access this page.", toast.error, false);
                navigate("/");
            } else {
                setLoading(false);
            }
        });
    }, []);

    return (
        <>
            <h1>DoAR</h1>
        </>
    )   
}

export { Home };