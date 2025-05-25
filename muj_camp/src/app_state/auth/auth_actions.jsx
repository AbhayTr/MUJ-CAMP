export const grantSessionAccess = (authToken, authEmail, authName, authRoles, photo) => ({
    type: "GRANT_ACCESS",
    authToken: authToken,
    authEmail: authEmail,
    authName: authName,
    authRoles: authRoles,
    photo: photo
});

export const setSessionRoles = (authRoles) => ({
    type: "UPDATE_ROLES",
    authRoles: authRoles
});

export const setSessionRole = (authRole) => ({
    type: "SET_ROLE",
    authRole: authRole
});

export const revokeSessionAccess = () => ({
    type: "REVOKE_ACCESS"
});