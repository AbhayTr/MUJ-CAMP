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
import { AdminPages, AuthRoles } from "../constants/roles";
import { showCredits } from "../tools/UI";

const Sidebar = ({
    sidebarMenuClass
}) => {
    return (
        <div
            id="sideBarDiv"
            style={{
                display: "flex",
                height: "100%",
                width: "80px",
                overflow: "scroll initial"
            }}
        >
            <CDBSidebar
                className={sidebarMenuClass}
                textColor="#fff"
                backgroundColor="darkorange"
                toggled={true}
                breakpoint={Infinity}
            >
                <div style={{
                    alignSelf: "center",
                    textAlign: "center",
                    marginTop: "0.7em"
                }}>
                    <img
                        className="home-logo"
                        style={{
                            width: "70px",
                            height: "auto"
                        }}
                        src = {mujLogo}
                        alt = "Manipal"
                    />
                    <img
                        className="doar-logo"
                        style={{
                            width: "70px",
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
                        />
                    }
                >
                    MUJ CAMP 🎓
                </CDBSidebarHeader>

                <CDBSidebarContent className="sidebar-content">
                    <CDBSidebarMenu>
                        {AdminPages[AuthStore.getState().authRole].map((adminPage) => {
                            return (
                                <NavLink
                                    key={adminPage.path}
                                    to={adminPage.path}
                                    onClick={() => {
                                        if (document.getElementsByClassName("toggled").length === 0) {
                                            document.getElementsByClassName("icon-suffix")[0].click();
                                        }
                                    }}
                                    activeclassname="activeClicked"
                                >
                                    <CDBSidebarMenuItem
                                        icon={adminPage.icon}
                                    >
                                        {adminPage.name}
                                    </CDBSidebarMenuItem>
                                </NavLink>     
                            );
                        })}
                        <span
                            onClick={async () => {
                                await showCredits();
                            }}
                        >
                            <CDBSidebarMenuItem
                                icon="exclamation-circle"
                            >
                                Credits
                            </CDBSidebarMenuItem>
                        </span>
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
                        <b>
                            {(AuthStore.getState().authRole === AuthRoles.DOAR) ? "DoAR Portal" : "Admin Portal"}
                        </b>
                    </div>
                </CDBSidebarFooter>
            </CDBSidebar>
        </div>
    );
};

export default Sidebar;