import { useEffect } from "react"
import { showAlert } from "../tools/UI";
import { toast } from "react-toastify";
import { Navigate } from "react-router";

const Error404 = () => {

    useEffect(() => {
        showAlert("Page not found", toast.error, false);
    }, []);

    return (<Navigate to={`${process.env.REACT_APP_PATH_ROOT}/`} />);

}

export default Error404;