const NavigateReducer = (navigateState = {
    adminPage: "Home"
}, navigateAction) => {
    switch (navigateAction.type) {
        case "SET_PAGE":
            return {
                ...navigateState,
                adminPage: navigateAction.adminPage
            };
        default:
            return {};
    }
}

export default NavigateReducer;