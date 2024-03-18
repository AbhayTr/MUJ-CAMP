const AuthReducer = (authState = {}, authAction) => {
    switch (authAction.type) {
        case "GRANT_ACCESS":
            return {
                ...authState,
                authToken: authAction.authToken,
                authEmail: authAction.authEmail,
                authName: authAction.authName,
                authRoles: authAction.authRoles,
                photo: authAction.photo
            };
        case "UPDATE_ROLES":
            return {
                ...authState,
                authRoles: authAction.authRoles
            }
        case "SET_ROLE":
            return {
                ...authState,
                authRole: authAction.authRole
            }
        case "REVOKE_ACCESS":
            return {};
        case "REHYDRATE":
            return {
                ...authState,
                ...authAction.payload
            };
        default:
            return {};
    }
}

export default AuthReducer;