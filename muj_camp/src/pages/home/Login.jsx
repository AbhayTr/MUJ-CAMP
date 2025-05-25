/* eslint-disable react-hooks/exhaustive-deps */

import "react-toastify/dist/ReactToastify.css";

import { toast } from "react-toastify";
import { connect } from "react-redux";
import { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import { useNavigate } from "react-router-dom";

import LoadButton from "../../custom_components/LoadButton";
import VInput from "../../custom_components/VInput";
import { InputConfigState } from "../../tools/Config";
import { AuthStore } from "../../app_state/auth/auth";
import { grantSessionAccess, setSessionRole } from "../../app_state/auth/auth_actions";
import { playSound, showAlert, confirmLogout } from "../../tools/UI";

let Login = ({
    isLoginLoading,
    authName = null
}) => {

    const elementMap = {
        LOGIN_INPUT: "lp-input"
    };

    const [inputConfigState, setInputConfigState] = useState({});

    const [lbhLoading, setLBHLoading] = useState(false);
    const [lbLoading, setLBLoading] = useState(false);
    const [rbLoading, setRBLoading] = useState(false);
    const [lbhDisabled, setLBHDisabled] = useState(false);
    const [lbDisabled, setLBDisabled] = useState(false);
    const [userInputIgnored, setUserInputIgnored] = useState(false);
    const [rbDisabled, setRBDisabled] = useState(false);
    const [cbDisabled, setCBDisabled] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);

    const [retry, triggerRetry] = useState(false);
    const [submitStop, triggerSubmitStop] = useState(false);
    const [loginBoxDisabled, setLoginBoxDisabled] = useState(false);

    const inputBoxButtonDisable = (toggleBoolean) => {
        if (authDetails.authState === 0) {
            setLBHDisabled(toggleBoolean);
        } else {
            setLBDisabled(toggleBoolean);
        }
    };

    const resendText = "Resend OTP";
    const continueText = "Continue";
    const [rbText, setRBText] = useState(resendText);
    const [lbText, setLBText] = useState(continueText);

    const [authDetails, setAuthDetails] = useState({
        authState: 0
    });
    const navigate = useNavigate();
    
    const handleClickLogin = () => {
        if (userInputIgnored) {
            return;
        }
        if (!InputConfigState.inputCustomValidated(elementMap.LOGIN_INPUT, inputConfigState, setInputConfigState, authDetails)) {
            return;
        }
        if (authDetails.authState === 0) {
            if (lbLoading) {
                return;
            }
            setLBHLoading(true);
            setAuthDetails({
                authState: 1,
                authManipalId: document.getElementById(elementMap.LOGIN_INPUT).value
            });
        } else if (authDetails.authState === 2) {
            if (lbLoading || rbLoading) {
                return;
            }
            setCBDisabled(true);
            setRBDisabled(true);
            setLBLoading(true);
            setAuthDetails({
                ...authDetails,
                authState: 3
            });
        }
    };

    const handleClickResend = () => {
        setLBDisabled(true);
        setRBLoading(true);
        setCBDisabled(true);
        axios.post(`${process.env.REACT_APP_BACKEND}/signin/login`, {
            authManipalId: authDetails.authEmail,
            sid: authDetails.sid
        })
        .then((response) => {
            if (InputConfigState.getInputVerified(elementMap.LOGIN_INPUT, inputConfigState)) {
                setLBDisabled(false);
            }
            setRBLoading(false);
            setCBDisabled(false);
            setRBDisabled(true);

            let timeToWait = 11;

            function updateTime() {
                if (timeToWait === 0) {
                    setRBText(resendText);
                    setRBDisabled(false);
                } else {
                    setRBText(`Resend OTP can be used after ${timeToWait} second(s)`);
                    timeToWait--;
                    setTimeout(updateTime, 1000);
                }
            }

            updateTime();

            if (response.data.status === "s") {
                showAlert(`OTP successfully resent to ${authDetails.emailSentTo}!`);
            } else {
                if (response.data.status === "f" && response.data.error != null) {
                    showAlert(response.data.error, toast.error);
                } else {
                    setAuthDetails({
                        ...authDetails,
                        authState: 0
                    });
                    appDown();
                }
            }
        })
        .catch((errorReason) => {
            setAuthDetails({
                ...authDetails,
                authState: 0
            });
            if (InputConfigState.getInputVerified(elementMap.LOGIN_INPUT, inputConfigState)) {
                setLBDisabled(false);
            }
            setRBLoading(false);
            setCBDisabled(false);
            appDown();
        });
    };

    const handleClickCancel = () => {
        document.getElementById(elementMap.LOGIN_INPUT).value = "";
        InputConfigState.resetInvalidInput(elementMap.LOGIN_INPUT, inputConfigState, setInputConfigState);
        showAlert("Ok bye bye 👋");
        setLBHDisabled(false);
        if (lbText === continueText) {
            setLBDisabled(false);
        }
        setLoginBoxDisabled(false);
        setUserInputIgnored(false);
        setAuthDetails({
            authState: 0
        });
    };

    const onKeyDown = e => {
        if (e.keyCode === 13) {
            handleClickLogin();
        }
    }

    const isValidManipalEmail = (inputText) => {
        if (inputText.length < 4) {
            return false;
        }
        return (/^\S+@jaipur.manipal.edu/.test(inputText) || /^\S+@muj.manipal.edu/.test(inputText) || /^\w+\.\w+$/.test(inputText) || /^[a-zA-Z0-9]*$/.test(inputText));
    }

    const isValidOTP = (inputText) => {
        if (inputText.length !== 6) {
            return "OTP has to be of exact 6 digits.";
        }
        if (isNaN(inputText)) {
            return "OTP has to be a number of 6 digits.";
        }
        return "";
    }

    const validateInputMessage = (inputText, authDetails) => {
        let toReturn = "";
        if (inputText === "") {
            if (authDetails.authState === 0) {
                toReturn = "Empty Manipal ID. Kindly enter a proper Manipal Email ID or Manipal Registration Number and try again.";
            } else if (authDetails.authState === 2) {
                toReturn = "Empty OTP. Kindly enter a proper 6 digit OTP and try again.";
            }
        } else {
            if (authDetails.authState === 0) {
                if (!isValidManipalEmail(inputText)) {
                    toReturn = "Invalid Manipal ID. Kindly enter a proper Manipal Email ID or Manipal Registration Number and try again."
                }
            } else if (authDetails.authState === 2) {
                toReturn = isValidOTP(inputText);
            }
        }
        if (toReturn !== "") {
            playSound("e");
        }
        return toReturn;
    }

    const appDown = () => {
        if (document.getElementById(elementMap.LOGIN_INPUT) !== null) {
            document.getElementById(elementMap.LOGIN_INPUT).value = "";
        }
        showAlert(process.env.REACT_APP_DOWN_MESSAGE, toast.error);
    };

    useEffect(() => {

        InputConfigState.setCaseInsensetive(true, elementMap.LOGIN_INPUT, inputConfigState, setInputConfigState);

    }, []);

    useEffect(() => {

        InputConfigState.setCustomValidateMessage(validateInputMessage, elementMap.LOGIN_INPUT, inputConfigState, setInputConfigState);

    }, [InputConfigState.getCaseInsensetive(elementMap.LOGIN_INPUT, inputConfigState)]);

    useEffect(() => {

        if (retry) {
            handleClickLogin();
            triggerRetry(false);
        }

    }, [retry]);

    useEffect(() => {
        
        if (submitStop) {
            setLBDisabled(true);
            setUserInputIgnored(true);
                            
            let timeToWait = 6;

            function updateTime() {
                if (timeToWait === 0) {
                    setLBText(continueText);
                    if (InputConfigState.getInputVerified(elementMap.LOGIN_INPUT, inputConfigState)) {
                        setLBDisabled(false);
                    }
                    setUserInputIgnored(false);
                } else {
                    setLBText(`Please wait for ${timeToWait} second(s) before continuing`);
                    timeToWait--;
                    setTimeout(updateTime, 1000);
                }
            }

            updateTime();
            triggerSubmitStop(false);
        }

    }, [submitStop])

    useEffect(() => {

        if (authDetails.authState === 0 || authDetails.authState === 2) {
            return;
        }

        if (authDetails.authState === 1) {
            axios.post(`${process.env.REACT_APP_BACKEND}/signin/login`, {
                authManipalId: authDetails.authManipalId
            })
            .then((response) => {
                setLBHLoading(false);
                if (response.data.status === "s") {
                    if (lbDisabled) {
                        setUserInputIgnored(true);
                    }
                    document.getElementById(elementMap.LOGIN_INPUT).value = "";
                    showAlert(`OTP sent successfully to ${response.data.emailSentTo}!`);
                    InputConfigState.resetInvalidInput(elementMap.LOGIN_INPUT, inputConfigState, setInputConfigState);
                    setAuthDetails({
                        authState: 2,
                        authName: response.data.authName,
                        authEmail: response.data.authEmail,
                        emailSentTo: response.data.emailSentTo,
                        sid: response.data.sid,
                        photo: response.data.photo
                    });
                } else {
                    setAuthDetails({
                        ...authDetails,
                        authState: 0
                    });
                    if (response.data.status === "f" && response.data.error != null) {
                        if (response.data.error.startsWith("%D% ")) {
                            setLoginBoxDisabled(true);
                            var waitTime = parseInt(response.data.error.split(" ")[1]);
                            
                            function holdOn() {
                                if (waitTime === 0) {
                                    InputConfigState.clearInputError(elementMap.LOGIN_INPUT, inputConfigState, setInputConfigState);
                                    setLoginBoxDisabled(false);
                                    triggerRetry(true);
                                } else {
                                    InputConfigState.setInputError(`Hold on ⏳, Champ, you are too fast 🚀 (in requesting OTPs 🔐)! Please wait for ${waitTime} second(s) ⏱ before continuing.`, elementMap.LOGIN_INPUT, inputConfigState, setInputConfigState, null);
                                    waitTime--;
                                    setTimeout(holdOn, 1000);
                                }
                            }
                            
                            holdOn();
                        } else {
                            showAlert(response.data.error, toast.error);
                            InputConfigState.setInputError(response.data.error, elementMap.LOGIN_INPUT, inputConfigState, setInputConfigState, document.getElementById(elementMap.LOGIN_INPUT).value);
                        }
                    } else {
                        appDown();
                    }
                }
            })
            .catch((errorReason) => {
                setAuthDetails({
                    ...authDetails,
                    authState: 0
                });
                setLBHLoading(false);
                appDown();
            });
        } else if (authDetails.authState === 3) {
            axios.post(`${process.env.REACT_APP_BACKEND}/signin/validate`, {
                authEmail: authDetails.authEmail,
                sid: authDetails.sid,
                otp: document.getElementById(elementMap.LOGIN_INPUT).value
            })
            .then((response) => {
                setLBLoading(false);
                if (rbText === resendText) {
                    setRBDisabled(false);
                }
                setCBDisabled(false);
                if (response.data.status === "s") {
                    document.getElementById(elementMap.LOGIN_INPUT).value = "";
                    InputConfigState.resetInvalidInput(elementMap.LOGIN_INPUT, inputConfigState, setInputConfigState);
                    setAuthDetails({
                        ...authDetails,
                        authState: 4,
                    });
                    AuthStore.dispatch(grantSessionAccess(
                        response.data.authToken,
                        authDetails.authEmail,
                        authDetails.authName,
                        response.data.authRoles,
                        authDetails.photo
                    ));
                } else {
                    setAuthDetails({
                        ...authDetails,
                        authState: 2
                    });
                    if (response.data.status === "f" && response.data.error != null) {
                        showAlert(response.data.error, toast.error);
                        InputConfigState.setInputError(response.data.error, elementMap.LOGIN_INPUT, inputConfigState, setInputConfigState, document.getElementById(elementMap.LOGIN_INPUT).value);
                        if (response.data.error.toLowerCase().includes("wrong")) {
                            let forceResize = setInterval(() => {
                                if (document.getElementById(`${elementMap.LOGIN_INPUT}-alert`) != null) {
                                    document.getElementById(`${elementMap.LOGIN_INPUT}-alert`).style.width = `${document.getElementById(elementMap.LOGIN_INPUT).offsetWidth}px`;
                                    clearInterval(forceResize);
                                }
                            }, 1);
                            triggerSubmitStop(true);
                        }
                    } else {
                        appDown();
                    }
                }
            })
            .catch((errorReason) => {
                setAuthDetails({
                    ...authDetails,
                    authState: 2
                });
                setLBLoading(false);
                if (rbText === resendText) {
                    setRBDisabled(false);
                }
                setCBDisabled(false);
                appDown();
            });
        } else if (authDetails.authState === 4) {
            showAlert(`Hello ${authDetails.authName}!`);
            setAuthDetails({
                authState: 0
            });
            if (AuthStore.getState().authRoles.length === 1) {
                AuthStore.dispatch(setSessionRole(AuthStore.getState().authRoles[0]));
                navigate(`${process.env.REACT_APP_PATH_ROOT}/home`);
            }
        }

    }, [authDetails]);

    const hasAnyKindOfAccess = () => {
        return !(AuthStore.getState().authRoles == null || AuthStore.getState().authRoles.length === 0);
    }

    const getRoles = () => {
        return (
            <>
                {(!hasAnyKindOfAccess()) ? 
                    (
                        <Alert
                            variant="info"
                            style={{
                                fontWeight: "bold",
                                wordBreak: "break-word"
                            }}
                        >
                            You currently don't have access to use this app. Please contact {process.env.REACT_APP_CONTACT_PERSON} for further help.
                        </Alert>
                    ) :
                    (<></>)
                }
                {AuthStore.getState().authRoles.map((authRole, index) => {
                    return (
                        <LoadButton
                            key={authRole}
                            lbId={`${authRole}-button`}
                            clickHandler={() => {
                                AuthStore.dispatch(setSessionRole(authRole));
                                playSound("s");
                            }}
                            lbText={
                                <>
                                    Use app as <b>{authRole}</b>
                                </>
                            }
                            transitionTime="0"
                            path={`${process.env.REACT_APP_PATH_ROOT}/home`}
                            style={(index > 0) ? {
                                marginTop: "0.3em"
                            } : {}}
                        />
                    );
                })}
            </>
        );
    };

    return (
        <>
            <div className="login-panel-container">
                <div className="login-panel">
                    <span style={{
                        textAlign: "center"
                    }}>
                        <h1 className="muj-camp-heading">
                            <span style={{
                                fontSize: "0.7em"
                            }}>
                                Welcome to
                            </span>
                            <br/>
                            <span style={{
                                whiteSpace: "nowrap",
                                fontSize: "1.2em"
                            }}>
                                MUJ CAMP&nbsp;
                                <span className="muj-camp-heading-hat">🎓</span>
                            </span>
                        </h1>
                        <h6 style={{fontWeight: "bold"}}>Collective Alumni Management Portal</h6>
                        <br/>
                    </span>
                    {(isLoginLoading) ? (
                        <div className="component-loader-container">
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="component-loader"
                            />
                        </div>
                    ) : (
                        (authName === null) ? (
                            <>
                                {(authDetails.authState === 0 || authDetails.authState === 1) ?
                                    <>
                                        <p>
                                            Namaskar 🙏! Please enter your <b>Manipal Outlook E-Mail ID</b> 📧 or <b>Manipal Registration Number</b> 🆔 below 👇
                                        </p>
                                        <br/>
                                    </> :
                                    <></>
                                }
                                {((InputConfigState.getInputVerified(elementMap.LOGIN_INPUT, inputConfigState) || InputConfigState.getErrorMessage(elementMap.LOGIN_INPUT, inputConfigState) === undefined) && (authDetails.authState === 2 || authDetails.authState === 4)) ?
                                    <Alert
                                        variant="success"
                                        id={`${elementMap.LOGIN_INPUT}-alert`}
                                        style={{
                                            width: `${document.getElementById(elementMap.LOGIN_INPUT).offsetWidth}px`,
                                            fontWeight: "bold",
                                            wordBreak: "break-word"
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontWeight: "normal",
                                                textAlign: "justify"
                                            }}
                                        >
                                            {(authDetails.authState === 2) ?
                                                <> 
                                                    Hey <b>{authDetails.authName}</b> 👋<br/>
                                                    <br/>
                                                    An OTP has been sent to 📧:<br/><br/>
                                                    <b>{authDetails.emailSentTo}</b><br/>
                                                    (check spam mail as well)<br/>
                                                    <br/>
                                                    It may take upto a minute for the mail to be sent. Please enter that OTP below 👇
                                                </> :
                                                <></>
                                            }
                                        </span>
                                    </Alert> :
                                    <></>
                                }
                                <VInput
                                    configState={inputConfigState}
                                    setConfigState={setInputConfigState}
                                    id={elementMap.LOGIN_INPUT}
                                    placeholderText={(authDetails.authState !== 2) ?
                                        "Manipal ID" :
                                        "One Time Password"
                                    }
                                    onKeyDown={onKeyDown}
                                    ignoreInput={userInputIgnored}
                                    toggleButton={inputBoxButtonDisable}
                                    length={(authDetails.authState === 2) ? 6 : null}
                                    onlyNumeric={(authDetails.authState === 2)}
                                    disabled={!((authDetails.authState === 0 || authDetails.authState === 2)) || loginBoxDisabled}
                                    focusOnError={true}
                                />
                                {(authDetails.authState === 0 || authDetails.authState === 1) ? 
                                    <LoadButton
                                        lbLoading={lbhLoading}
                                        lbDisabled={lbhDisabled}
                                        lbText="Continue"
                                        lbId="loginh-button"
                                        clickHandler={handleClickLogin}
                                    /> : 
                                    <></>
                                }
                                {(authDetails.authState === 2 || authDetails.authState === 3) ?
                                    <>
                                        <LoadButton
                                            lbLoading={lbLoading}
                                            lbDisabled={lbDisabled}
                                            lbText={lbText}
                                            lbId="login-button"
                                            clickHandler={handleClickLogin}
                                        />
                                        <LoadButton
                                            lbLoading={rbLoading}
                                            lbDisabled={rbDisabled}
                                            lbText={rbText}
                                            lbId="resend-button"
                                            clickHandler={handleClickResend}
                                            type="primary"
                                            style={{marginTop: "0.2em"}}
                                        />
                                        <LoadButton
                                            lbDisabled={cbDisabled}
                                            lbText="Cancel"
                                            lbId="cancel-button"
                                            clickHandler={handleClickCancel}
                                            type="danger"
                                            style={{marginTop: "0.2em"}}
                                        />
                                    </> :
                                    <></>
                                }
                            </>
                        ) : (
                            <>
                                <div>
                                    Hey <b>{authName}</b> 👋
                                    <br/><br/>
                                    Namaste 🙏! How would you like to use the app today?
                                    <br/><br/>
                                    {getRoles()}
                                    {(hasAnyKindOfAccess()) ? (<br/>) : (<></>)}
                                    <LoadButton
                                        lbLoading={logoutLoading}
                                        lbText="Logout"
                                        lbId="logout-button"
                                        clickHandler={async () => {
                                            setLogoutLoading(true);
                                            await confirmLogout(navigate, () => {
                                                setLogoutLoading(false);
                                            });
                                        }}
                                        type="danger"
                                    />
                                </div>
                            </>
                        )
                    )}
                </div>
            </div>
        </>
    );
}

const mapAuthStateToLogin = (authState) => ({
    authName: authState.authName
});

Login = connect(
    mapAuthStateToLogin,
    null
)(Login);

export default Login;