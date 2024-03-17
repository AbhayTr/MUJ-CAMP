import mujLogo from "../assets/images/manipal.png";
import doarLogo from "../assets/images/doar.png";

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
            height: "100%",
            overflow: "scroll initial"
        }}>
            <CDBSidebar
                textColor="#fff"
                backgroundColor="darkorange"
                toggled={true}
                breakpoint={Infinity}
            >
                <div style={{
                    alignSelf: "center"
                }}>
                    <img
                        className="home-logo"
                        style={{
                            width: "80px",
                            height: "auto"
                        }}
                        src = {mujLogo}
                        alt = "Manipal"
                    />
                    <img
                        className="doar-logo"
                        style={{
                            width: "80px",
                            height: "auto"
                        }}
                        src = {doarLogo}
                        alt = "DoAR"
                    />
                </div>
                <CDBSidebarHeader
                    prefix={
                        <i
                            className="fa fa-bars fa-large"
                        ></i>
                    }
                >
                    <a
                        href="/home"
                        className="text-decoration-none"
                        style={{
                            color: "inherit"
                        }}
                    >
                        MUJ CAMP
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