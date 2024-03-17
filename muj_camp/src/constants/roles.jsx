import { Home as DoARHome } from "../pages/doar/Home";

const AuthRoles = {
    MASTER_ADMIN: "Master Admin",
    STUDENT: "Student",
    DOAR: "DoAR Admin"
};

const AuthPages = {
    STUDENT: AuthRoles.STUDENT,
    DOAR: AuthRoles.DOAR
};

const AdminRoles = [
    AuthRoles.DOAR
];

const AdminPages = {};

AdminPages[AuthRoles.DOAR] = [
    {
        name: "Home",
        path: "home",
        icon: "columns",
        component: <DoARHome/>
    },
    {
        name: "Dashboard",
        path: "dashboard",
        icon: "chart-line",
        component: <></>
    }
]

export { AuthRoles, AuthPages, AdminRoles, AdminPages };