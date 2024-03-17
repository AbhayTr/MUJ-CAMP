import axios from "axios";

import { AuthStore } from "../app_state/auth/auth";
import { setSessionRoles, setSessionRole, revokeSessionAccess } from "../app_state/auth/auth_actions";

const validateToken = (onLoggedOut) => {
    let authState = AuthStore.getState();
    if (authState.authToken == null ||  authState.authEmail == null ||  authState.authName == null) {
        onLoggedOut(false);
        return null;
    }
    return authState;
}

const appDown = () => {
    window.location = "/down";
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

const makeSessionRequest = (requestPath, requestPayload, onSuccess, onLoggedOut, onSystemDown = appDown, headers = {}) => {
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

export { validateSession, makeSessionRequest };