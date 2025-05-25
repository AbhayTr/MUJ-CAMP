import axios from "axios";
import { toast } from "react-toastify";

import { AuthStore } from "../app_state/auth/auth";
import { setSessionRoles, revokeSessionAccess } from "../app_state/auth/auth_actions";
import { showAlert } from "./UI";
import { isAuthorized } from "./Rights";
import { AuthPages } from "../constants/roles";

const validateToken = (onLoggedOut) => {
    let authState = AuthStore.getState();
    if (authState.authToken == null ||  authState.authEmail == null ||  authState.authName == null) {
        onLoggedOut(false);
        return null;
    }
    return authState;
}

const appDown = () => {
    window.location = `${process.env.REACT_APP_PATH_ROOT}/down`;
}

const validateSession = (onLoggedOut, onLoggedIn = null, fetchRoles = false, validateTokenOnly = false) => {
    let authState = validateToken(onLoggedOut);
    if (authState == null) {
        return;
    }
    if (validateTokenOnly) {
        onLoggedOut(true);
        return;
    }
    axios.post(`${process.env.REACT_APP_BACKEND}/auth/validate`, {
        authEmail: authState.authEmail,
        fetchRoles: fetchRoles
    }, {
        headers: {
            Authorization: `Bearer ${authState.authToken}`
        }
    })
    .then((response) => {
        if (response.data.status === "s") {
            if (fetchRoles) {
                AuthStore.dispatch(setSessionRoles(response.data.authRoles));
            }
            if (onLoggedIn !== null) {
                onLoggedIn();
            }
        } else {
            appDown();
        }
    })
    .catch((errorReason) => {
        if (errorReason != null && errorReason.response != null && JSON.stringify(errorReason.response.data).toLowerCase().includes("request aborted")) {
            window.location.reload();
        }
        if (errorReason.response?.status === 403) {
            AuthStore.dispatch(revokeSessionAccess());
            onLoggedOut(true);
        } else {
            appDown();
        }
    });
}

const makeSessionRequestGet = (requestPath, onSuccess, onLoggedOut, onSystemDown = appDown, headers = {}) => {
    let authState = validateToken(onLoggedOut);
    if (authState == null) {
        return;
    }
    let requestHeaders = {
        ...headers,
        Authorization: `Bearer ${authState.authToken}`
    }
    axios.get(`${process.env.REACT_APP_BACKEND}${requestPath}`, {
        headers: requestHeaders
    })
    .then((response) => {
        onSuccess(response);
    })
    .catch((errorReason) => {
        errorReason = String(errorReason);
        if (errorReason.toLowerCase().includes("request aborted")) {
            window.location.reload();
        }
        if (errorReason.response?.status === 403) {
            AuthStore.dispatch(revokeSessionAccess());
            onLoggedOut(true);
        } else {
            onSystemDown();
        }
    });
}

const makeSessionRequestPost = (requestPath, requestPayload, onSuccess, onLoggedOut, onSystemDown = appDown, headers = {}) => {
    let authState = validateToken(onLoggedOut);
    if (authState == null) {
        return;
    }
    let requestHeaders = {
        ...headers,
        Authorization: `Bearer ${authState.authToken}`
    }
    axios.post(`${process.env.REACT_APP_BACKEND}${requestPath}`, requestPayload, {
        headers: requestHeaders
    })
    .then((response) => {
        onSuccess(response);
    })
    .catch((errorReason) => {
        errorReason = String(errorReason);
        if (errorReason.toLowerCase().includes("request aborted")) {
            window.location.reload();
        }
        if (errorReason.response?.status === 403) {
            AuthStore.dispatch(revokeSessionAccess());
            onLoggedOut(true);
        } else {
            onSystemDown();
        }
    });
}

const ensureAdminAccess = (pageName, setLoading, navigate) => {
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
        if (!isAuthorized(AuthPages[pageName], true)) {
            showAlert("You are not authorized to access this page.", toast.error, false);
            navigate(`${process.env.REACT_APP_PATH_ROOT}/`);
        } else {
            setLoading(false);
        }
    });
}

const makeWebSocketRequest = (webSocket, data) => {
    if (webSocket == null) {
        return;
    }
    webSocket.send(JSON.stringify({
        "auth": {
            "authEmail": AuthStore.getState().authEmail,
            "authToken": AuthStore.getState().authToken
        },
        "data": data
    }));
}

export { validateSession, makeSessionRequestPost, makeSessionRequestGet, ensureAdminAccess, makeWebSocketRequest };