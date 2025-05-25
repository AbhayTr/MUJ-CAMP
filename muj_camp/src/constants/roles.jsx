import { Home as DoARHome } from "../pages/doar/Home";
import { Dashboard as DoARDashboard } from "../pages/doar/Dashboard";

const AuthRoles = {
    MASTER_ADMIN: "Master Admin",
    STUDENT: "Student",
    DOAR: "DoAR Admin"
};

const AdminRoles = [
    AuthRoles.MASTER_ADMIN,
    AuthRoles.DOAR
];

const AdminPages = {};

AdminPages[AuthRoles.DOAR] = [
    {
        name: "Home",
        path: "home",
        icon: "columns",
        component: <DoARHome />
    },
    {
        name: "Dashboard",
        path: "dashboard",
        icon: "chart-line",
        component: <DoARDashboard />
    }
]

const AuthPages = {
    STUDENT: AuthRoles.STUDENT,
    DOAR: AdminPages[AuthRoles.DOAR][0].name,
    DOAR_DASHBOARD: AdminPages[AuthRoles.DOAR][1].name
};

const rightsMap = {};

/* eslint-disable no-lone-blocks */
{
    rightsMap[AuthRoles.STUDENT] = [
        AuthPages.STUDENT
    ];
    rightsMap[AuthRoles.DOAR] = [
        AuthPages.DOAR,
        AuthPages.DOAR_DASHBOARD
    ];
}

export { AuthRoles, AuthPages, AdminRoles, AdminPages, rightsMap };