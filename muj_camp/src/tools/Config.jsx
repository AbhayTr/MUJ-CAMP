class InputConfigState {

    static setCaseInsensetive = (caseInsensetive, id, configState, setConfigState) => {
        const newConfigState = {
            ...configState
        };
        if (newConfigState[id] === undefined) {
            newConfigState[id] = {
                caseInsensetive: caseInsensetive
            };
        } else {
            newConfigState[id].caseInsensetive = caseInsensetive;
        }
        setConfigState(newConfigState);
    }

    static getCaseInsensetive = (id, configState) => {
        if (configState[id] === undefined || configState[id].caseInsensetive === undefined) {
            return true;
        } else {
            return configState[id].caseInsensetive;
        }
    }

    static setCustomValidateMessage = (customValidateMessage, id, configState, setConfigState) => {
        const newConfigState = {
            ...configState
        };
        if (newConfigState[id] === undefined) {
            newConfigState[id] = {
                customValidateMessage: customValidateMessage
            };
        } else {
            newConfigState[id].customValidateMessage = customValidateMessage;
        }
        setConfigState(newConfigState);
    }

    static getCustomValidateMessage = (id, configState) => {
        if (configState[id] === undefined || configState[id].customValidateMessage === undefined) {
            return null;
        } else {
            return configState[id].customValidateMessage;
        }
    }

    static setInputVerified = (inputVerified, id, configState, setConfigState) => {
        const newConfigState = {
            ...configState
        };
        if (newConfigState[id] === undefined) {
            newConfigState[id] = {
                inputVerified: inputVerified
            };
        } else {
            newConfigState[id].inputVerified = inputVerified;
        }
        setConfigState(newConfigState);
    }

    static getInputVerified = (id, configState) => {
        if (configState[id] === undefined || configState[id].inputVerified === undefined) {
            return true;
        } else {
            return configState[id].inputVerified;
        }
    }

    static setErrorMessage = (errorMessage, id, configState, setConfigState) => {
        const newConfigState = {
            ...configState
        };
        if (newConfigState[id] === undefined) {
            newConfigState[id] = {
                errorMessage: errorMessage
            };
        } else {
            newConfigState[id].errorMessage = errorMessage;
        }
        setConfigState(newConfigState);
    }

    static getErrorMessage = (id, configState) => {
        if (configState[id] === undefined || configState[id].errorMessage === undefined) {
            return "";
        } else {
            return configState[id].errorMessage;
        }
    }

    static setInputError = (errorMessage, id, configState, setConfigState, invalidInput = null) => {
        InputConfigState.setInputVerified(false, id, configState, setConfigState);
        InputConfigState.setErrorMessage(errorMessage, id, configState, setConfigState);
        if (invalidInput !== null) {
            InputConfigState.addInvalidInput(invalidInput, errorMessage, id, configState, setConfigState);
        }
    };

    static addInvalidInput = (invalidInput, errorMessage, id, configState, setConfigState) => {
        if (InputConfigState.getCaseInsensetive(id, configState)) {
            invalidInput = invalidInput.toLowerCase();
        }
        const newInvalidInput = {};
        newInvalidInput[invalidInput] = errorMessage;
        const newConfigState = {
            ...configState
        };
        if (newConfigState[id] === undefined) {
            newConfigState[id] = {
                invalidInputs: {
                    ...newInvalidInput
                }
            };
        } else if (newConfigState[id].invalidInputs === undefined) {
            newConfigState[id].invalidInputs = {
                ...newInvalidInput
            };
        } else {
            newConfigState[id].invalidInputs[invalidInput] = errorMessage;
        }
        setConfigState(newConfigState);
    }

    static resetInvalidInput = (id, configState, setConfigState) => {
        const newConfigState = {
            ...configState
        };
        if (newConfigState[id] === undefined) {
            newConfigState[id] = {
                invalidInputs: {}
            };
        } else {
            newConfigState[id].invalidInputs = {};
        }
        setConfigState(newConfigState);
        InputConfigState.clearInputError(id, configState, setConfigState);
    }

    static getInvalidInputErrorMessage = (invalidInput, id, configState) => {
        if (configState[id] === undefined || configState[id].invalidInputs === undefined) {
            return undefined;
        } else {
            return configState[id].invalidInputs[invalidInput];
        }
    }

    static inputIsNotValidated = (inputText, id, configState) => {
        if (configState[id] === undefined || configState[id].invalidInputs === undefined) {
            return false;
        } else {
            if (InputConfigState.getCaseInsensetive(id, configState)) {
                inputText = inputText.toLowerCase();
            }
            return inputText in configState[id].invalidInputs;
        }
    }

    static clearInputError = (id, configState, setConfigState) => {
        if (InputConfigState.inputIsNotValidated(document.getElementById(id).value, id, configState)) {
            return;
        }
        InputConfigState.setInputVerified(true, id, configState, setConfigState);
        InputConfigState.setErrorMessage("", id, configState, setConfigState);
    };

    static inputCustomValidated = (id, configState, setConfigState, params = null) => {
        if (InputConfigState.getCustomValidateMessage(id, configState) === null) {
            return true;
        }
        let inputText = document.getElementById(id).value;
        if (InputConfigState.inputIsNotValidated(inputText, id, configState)) {
            return false;
        }
        let customValidatedMessage = (InputConfigState.getCustomValidateMessage(id, configState))(inputText, params);
        if (customValidatedMessage !== "") {
            InputConfigState.addInvalidInput(inputText, customValidatedMessage, id, configState, setConfigState);
            InputConfigState.setInputError(customValidatedMessage, id, configState, setConfigState);
            return false;
        }
        return true;
    }

}

export { InputConfigState };