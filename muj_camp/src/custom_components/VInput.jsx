/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect } from "react";
import Alert from "react-bootstrap/Alert";

import { InputConfigState } from "../tools/Config";

const VInput = ({
    configState,
    setConfigState,
    id,
    placeholderText,
    onKeyDown,
    required = true,
    toggleButton = null,
    type = "text",
    length = null,
    onlyNumeric = false,
    disabled = false,
    ignoreInput = false,
    focusOnError = false,
}) => {

    useEffect(() => {

        window.onresize = () => {
            if (document.getElementById(`${id}-alert`) == null) {
                return;
            }
            document.getElementById(`${id}-alert`).style.width = `${document.getElementById(id).offsetWidth}px`;
        };
        return (() => {
            window.onresize = () => {};
        });

    }, []);

    useEffect(() => {

        if (ignoreInput) {
            return;
        }

        if (focusOnError) {
            document.getElementById(id).focus();
        }

        if (toggleButton !== null) {
            toggleButton(!InputConfigState.getInputVerified(id, configState));
        }

    }, [InputConfigState.getInputVerified(id, configState)])

    const onKeyDownInternal = event => {
        onKeyDown(event);
        const keyCode = event.keyCode;
        if (keyCode === 13 || keyCode === 8 || keyCode === 37 || keyCode === 39 || ((keyCode === 65 || keyCode === 97) && event.ctrlKey) || keyCode === 9) {
            return;
        }
        if (onlyNumeric) {
            if (keyCode < 48 || keyCode > 57) {
                event.preventDefault();
            }
        }
    }

    const sanitizeInput = (inputText) => {
        let sanitizedText = inputText;
        for (let i = 0; i < inputText.length; i++) {
            let c = inputText[i];
            if (isNaN(c)) {
                sanitizedText = inputText.substring(0, i) + inputText.substring(i + 1);
            }
        }
        return sanitizedText;
    }

    const onInputChange = inputEvent => {
        let inputText = inputEvent.target.value;
        if (onlyNumeric) {
            let inputElement = inputEvent.target;
            inputElement.value = sanitizeInput(inputElement.value);
            inputText = inputElement.value;
        }
        if (InputConfigState.inputIsNotValidated(inputText, id, configState)) {
            InputConfigState.setInputVerified(false, id, configState, setConfigState);
            if (InputConfigState.getCaseInsensetive(id, configState)) {
                inputText = inputText.toLowerCase();
            }
            InputConfigState.setErrorMessage(InputConfigState.getInvalidInputErrorMessage(inputText, id, configState, setConfigState), id, configState, setConfigState);
        } else {
            InputConfigState.clearInputError(id, configState, setConfigState);
        }
    };

    return (
        <>
            {(InputConfigState.getInputVerified(id, configState) || InputConfigState.getErrorMessage(id, configState) === undefined) ?
                <></> :
                <Alert
                    variant="danger"
                    id={`${id}-alert`}
                    style={{
                        marginBottom: "0.5em",
                        width: `${document.getElementById(id).offsetWidth}px`,
                        borderColor: "red",
                        color: "red",
                        fontWeight: "bold",
                        wordBreak: "break-word"
                    }}
                >
                    {InputConfigState.getErrorMessage(id, configState)}
                </Alert>
            }
            <div className="form-textbox">
                <input
                    type={type}
                    id={id}
                    disabled={disabled}
                    maxLength={length}
                    required={required}
                    inputMode={(onlyNumeric) ? "numeric" : null}
                    className="force-ltr form-textbox-input"
                    onKeyDown={onKeyDownInternal}
                    onInput={onInputChange}
                    style={
                        (InputConfigState.getInputVerified(id, configState)) ? {} : {
                            borderColor: "red",
                            borderWidth: "0.28em"
                        }
                    }
                />
                <span
                    aria-hidden="true"
                    className="form-textbox-label form-label-flyout"
                    style={
                        (InputConfigState.getInputVerified(id, configState)) ? {} : {
                            color: "red"
                        }
                    }
                >
                    {placeholderText}
                </span>
            </div>
        </>
    );
}

export default VInput;