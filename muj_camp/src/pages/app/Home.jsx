/* eslint-disable react-hooks/exhaustive-deps */

import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { AuthStore } from "../../app_state/auth/auth";
import { Home as StudentHome } from "../../pages/student/Home";
import { AuthRoles } from "../../constants/roles";
import { validateSession } from "../../tools/Auth";
import { showAlert } from "../../tools/UI";
import { toast } from "react-toastify";
import { isAdmin } from "../../tools/Rights";
import LoadSpinner from "../../custom_components/LoadSpinner";

const Home = () => {

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        validateSession((sessionExisted) => {
            if (!sessionExisted) {
                showAlert("Please sign-in to continue.", toast.info, false);
                navigate(`${process.env.REACT_APP_PATH_ROOT}/`);
            } else {
                setLoading(false);
            }
        }, null, false, true);
    }, []);

    return (
        (loading) ? (
            <LoadSpinner />
        ) : (
            (AuthStore.getState().authRole === AuthRoles.STUDENT) ? (
                (<StudentHome />)
            ) : (isAdmin(AuthStore.getState().authRole)) ? (
                (<Navigate to={`${process.env.REACT_APP_PATH_ROOT}/admin/home`} />)
            ) : (<Navigate to={`${process.env.REACT_APP_PATH_ROOT}/`} />)
        )
    );
}

export { Home };