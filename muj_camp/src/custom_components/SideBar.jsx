import React from "react";
import {
    CDBSidebar,
    CDBSidebarContent,
    CDBSidebarFooter,
    CDBSidebarHeader,
    CDBSidebarMenu,
    CDBSidebarMenuItem,
} from "cdbreact";
import { NavLink } from "react-router-dom";

import { AuthStore } from "../app_state/auth/auth";
import { AdminPages } from "../constants/roles";
import { setPage } from "../app_state/admin/navigate/navigate_actions";

const Sidebar = () => {
    return (
        <div style={{
            display: "flex",
            height: "100vh",
            overflow: "scroll initial"
        }}>
            <CDBSidebar
                textColor="#fff"
                backgroundColor="#333"
            >
                <CDBSidebarHeader
                    prefix={<i className="fa fa-bars fa-large"></i>}
                >
                    <a
                        href="/home"
                        className="text-decoration-none"
                        style={{
                            color: "inherit"
                        }}
                    >
                        Sidebar
                    </a>
                </CDBSidebarHeader>

                <CDBSidebarContent className="sidebar-content">
                    <CDBSidebarMenu>
                        {AdminPages[AuthStore.getState().authRole].map((adminPage) => {
                            return (
                                <NavLink
                                    key={adminPage.path}
                                    to={adminPage.path}
                                    activeclassname="activeClicked"
                                    onClick={() => setPage(adminPage.name)}
                                >
                                    <CDBSidebarMenuItem
                                        icon={adminPage.icon}
                                    >
                                        {adminPage.name}
                                    </CDBSidebarMenuItem>
                                </NavLink>     
                            );
                        })}
                    </CDBSidebarMenu>
                </CDBSidebarContent>

                <CDBSidebarFooter style={{
                    textAlign: "center"
                }}>
                    <div
                        style={{
                            padding: "20px 5px",
                        }}
                    >
                        Sidebar Footer
                    </div>
                </CDBSidebarFooter>
            </CDBSidebar>
        </div>
    );
};

export default Sidebar;