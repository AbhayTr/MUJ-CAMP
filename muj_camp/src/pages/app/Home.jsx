/* eslint-disable react-hooks/exhaustive-deps */

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Spinner from "react-bootstrap/Spinner";

import { AuthStore } from "../../app_state/auth/auth";
import { Home as StudentHome } from "../../pages/student/Home";
import { AuthRoles } from "../../constants/roles";
import { validateSession } from "../../tools/Auth";
import { showAlert } from "../../tools/UI";
import { toast } from "react-toastify";

const Home = () => {

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        validateSession((sessionExisted) => {
            if (!sessionExisted) {
                showAlert("Please sign-in to continue.", toast.info, false);
                navigate("/");
            } else {
                setLoading(false);
            }
        }, null, false, true);
    }, []);

    return (
        (loading) ? (
            <>
                <div
                    style={{
                        position: "absolute",
                        maxHeight: "100%",
                        maxWidth: "100%",
                        top: "0",
                        bottom: "0",
                        left: "0",
                        right: "0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="component-loader"
                    />
                </div>
            </>
        ) : (
            (AuthStore.getState().authRole === AuthRoles.STUDENT) ? (
                <StudentHome />
            ) : (
                <h1>{JSON.stringify(AuthStore.getState())}</h1>
            )
        )
    );
}

export { Home };