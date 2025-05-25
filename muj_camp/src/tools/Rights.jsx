import NavigateStore from "../app_state/admin/navigate/navigate";
import { setPage } from "../app_state/admin/navigate/navigate_actions";
import { AuthStore } from "../app_state/auth/auth";
import { rightsMap, AdminRoles } from "../constants/roles";

const isAuthorized = (featureAccessed, isAdmin = false) => {
    const currentRole = AuthStore.getState().authRole;
    const isAllowed = rightsMap[currentRole].includes(featureAccessed);
    if (isAllowed && isAdmin) {
        NavigateStore.dispatch(setPage(featureAccessed));
    }
    return isAllowed;
};

const isAdmin = (role) => {
    return AdminRoles.includes(role);
};

export { isAuthorized, isAdmin };