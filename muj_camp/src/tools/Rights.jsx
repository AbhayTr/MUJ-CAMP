import { AuthStore } from "../app_state/auth/auth";
import { AuthRoles, AuthPages, AdminRoles } from "../constants/roles";

const rightsMap = {};

rightsMap[AuthPages.STUDENT] = [
    AuthRoles.STUDENT
];

rightsMap[AuthPages.DOAR] = [
    AuthRoles.DOAR
];

const isAuthorized = (featureAccessed) => {
    const currentRole = AuthStore.getState().authRole;
    return rightsMap[featureAccessed].includes(currentRole);
};

const isAdmin = (role) => {
    return AdminRoles.includes(role);
};

export { isAuthorized, isAdmin };