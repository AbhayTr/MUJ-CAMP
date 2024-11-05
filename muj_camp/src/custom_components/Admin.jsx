/* eslint-disable react-hooks/exhaustive-deps */

import headerStyles from "../assets/scss/Header.module.scss";
import layoutStyles from "../assets/scss/Layout.module.scss";
import userPhoto from "../assets/images/userPhoto.svg";

import React, { useEffect, useState } from "react";
import {
    Navbar,
    Nav,
    NavLink,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
} from "reactstrap";
import { connect } from "react-redux";
import "animate.css";
import { Route, Routes, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import ProfileIcon from "../assets/images/profileIcon";
import logoutIcon from "../assets/images/logoutOutlined.svg";
import Sidebar from "./SideBar";
import { AdminPages } from "../constants/roles";
import { AuthStore } from "../app_state/auth/auth";
import { validateSession } from "../tools/Auth";
import { confirmLogout, showAlert } from "../tools/UI";
import Error404 from "../custom_components/404";
import LoadSpinner from "./LoadSpinner";

let AdminLayout = ({
    adminPage = "Home"
}) => {

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [isSmallScreen, setSmallScreen] = useState(false);

    const adjustContentHeight = () => {
        const contentHeight = document.getElementById("admin-page").offsetHeight - document.getElementById("menu-header").offsetHeight;
        document.getElementById("main-content").style.height = `${contentHeight}px`;
    }

    const adjust = () => {
        try {
            setSmallScreen(window.getComputedStyle(document.getElementById("userName")).display === "none");
            adjustContentHeight();
            if (document.getElementsByClassName("pro-sidebar").length === 0) {
                return;
            }
    
            if (window.getComputedStyle(document.getElementById("userName")).display === "none") {
                setSidebarMenuClass("complete-collapse");
                document.getElementById("sideBarDiv").style.width = "0px";
            } else {
                setSidebarMenuClass("");
                document.getElementsByClassName("pro-sidebar")[0].style.removeProperty("min-width");
                document.getElementsByClassName("pro-sidebar")[0].style.removeProperty("width");
                document.getElementById("sideBarDiv").style.width = "80px";
            }
        } catch (e) {}
    }

    useEffect(() => {

        window.addEventListener("resize", adjust);

        validateSession((sessionExisted) => {
            if (!sessionExisted) {
                showAlert("Please sign-in to continue.", toast.info, false);
                navigate(`${process.env.REACT_APP_PATH_ROOT}/`);
                return;
            } else {
                if (AuthStore.getState().authRole == null) {
                    showAlert("Please select how you want to use the app first", toast.info, false);
                    navigate(`${process.env.REACT_APP_PATH_ROOT}/`);
                }
                setLoading(false);
            }
        }, null, false, true);
        
        return (() => {
            window.removeEventListener("resize", adjust);
        });

    }, []);

    const [sidebarMenuClass, setSidebarMenuClass] = useState("");

    useEffect(() => {
        
        if (!loading) {
            adjust();
        }

        if (document.getElementsByClassName("icon-suffix").length === 0) {
            return;
        }

        document.getElementById("mainLayout").addEventListener("click", (e) => {
            if (document.getElementsByClassName("toggled").length === 0) {
                document.getElementsByClassName("icon-suffix")[0].click();
            }
        });

        document.getElementsByClassName("icon-suffix")[0].addEventListener("click", (e) => {
            if (window.getComputedStyle(document.getElementById("userName")).display === "none") {
                if (document.getElementsByClassName("toggled").length === 0) {
                    document.getElementsByClassName("pro-sidebar")[0].style.setProperty("min-width", "0px", "important");
                    document.getElementsByClassName("pro-sidebar")[0].style.setProperty("width", "0px", "important");
                } else {
                    document.getElementsByClassName("pro-sidebar")[0].style.setProperty("min-width", "270px", "important");
                    document.getElementsByClassName("pro-sidebar")[0].style.setProperty("width", "270px", "important");
                }
            }
        });

    }, [loading]);

    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    }

    return (
        (loading) ? (
            <LoadSpinner />
        ) : (
            <div style={{
                display: "flex",
                position: "fixed",
                height: "100%",
                width: "100%",
                overflow: "hidden"
            }}>
                <Sidebar
                    sidebarMenuClass={sidebarMenuClass}
                />
                <div
                    id="admin-page"
                    style={{
                        flex: "1 1 auto",
                        overflow: "hidden"
                    }}
                >
                    <div
                        className={layoutStyles.root}
                        id="mainLayout"
                    >
                        <div className={layoutStyles.wrap}>
                            <Navbar
                                className={`${headerStyles.root} d-print-none`}
                                id="menu-header"
                            >
                                <div className="d-sm-block" inline="true">
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.4em"
                                    }}>
                                        {(isSmallScreen) ? (
                                            <button
                                                className="navbar-toggler"
                                                type="button"
                                                onClick={(e) => {
                                                    document.getElementsByClassName("icon-suffix")[0].click();
                                                }}
                                            >
                                                <span className="navbar-toggler-icon" />
                                            </button>
                                        ) : (<></>)}
                                        <h1>
                                            {adminPage}
                                        </h1>
                                    </div>
                                </div>
                                <Nav className="ml-auto">
                                    <Dropdown
                                        isOpen={menuOpen}
                                        toggle={() => toggleMenu()}
                                        nav id="basic-nav-dropdown"
                                        className="ml-3"
                                    >
                                        <DropdownToggle
                                            nav
                                            caret
                                            className="navbar-dropdown-toggle"
                                        >
                                            <span className={`${headerStyles.avatar} rounded-circle float-left mr-2`}>
                                                {(AuthStore.getState().photo != null) ? (
                                                    <img
                                                        src={AuthStore.getState().photo}
                                                        alt="User"
                                                        style={{
                                                            borderRadius: "50%"
                                                        }}
                                                        onLoad={() => {
                                                            try {
                                                                const removeDefault = setInterval(() => {
                                                                    try {
                                                                        document.getElementById("userPhoto").remove();
                                                                        clearInterval(removeDefault);
                                                                    } catch (e) {}
                                                                }, 1);
                                                            } catch (e) {}
                                                        }}
                                                    />
                                                ) : (
                                                    <></>
                                                )}
                                                <img
                                                    src={userPhoto}
                                                    alt="User"
                                                    id="userPhoto"
                                                    style={{
                                                        borderRadius: "50%"
                                                    }}
                                                />
                                            </span>
                                            <span
                                                id="userName"
                                                className="small d-none d-sm-block ml-1 mr-2 body-1"
                                                style={{
                                                    marginLeft: "0.5rem",
                                                    fontWeight: "bold",
                                                    fontSize: "1.1em"
                                                }}
                                            >
                                                {AuthStore.getState().authName}
                                            </span>
                                        </DropdownToggle>
                                        <DropdownMenu
                                            className="navbar-dropdown profile-dropdown"
                                            style={{
                                                width: "194px"
                                            }}>
                                            {(isSmallScreen) ? (
                                                <DropdownItem
                                                    disabled
                                                    className={headerStyles.dropdownProfileItem}
                                                    style={{
                                                        justifyContent: "center"
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            color: "#0d6efd",
                                                            fontSize: "1.1em",
                                                            fontWeight: "bold",
                                                            fontSynthesis: "initial"
                                                        }}
                                                    >
                                                        {AuthStore.getState().authName}
                                                    </span>
                                                </DropdownItem>
                                            ) : (
                                                <></>
                                            )}
                                            <DropdownItem
                                                className={headerStyles.dropdownProfileItem}
                                                onClick={() => {
                                                    showAlert("Please chose how do you want to use the app, from here.", toast.info);
                                                    navigate(`${process.env.REACT_APP_PATH_ROOT}/`);
                                                }}
                                            >
                                                <ProfileIcon />
                                                <span>
                                                    Switch User Role
                                                </span>
                                            </DropdownItem>
                                            <NavLink>
                                                <button
                                                    onClick={async () => {
                                                        await confirmLogout(navigate);
                                                    }}
                                                    className="btn btn-primary rounded-pill mx-auto logout-btn"
                                                >
                                                    <img
                                                        src={logoutIcon}
                                                        alt="Logout"
                                                    />
                                                    <span className="ml-1">Logout</span>
                                                </button>
                                            </NavLink>
                                        </DropdownMenu>
                                    </Dropdown>
                                </Nav>
                            </Navbar>
                            <main
                                className={layoutStyles.content}
                                id="main-content"
                            >
                                <Routes>
                                    {AdminPages[AuthStore.getState().authRole].map((adminPage) => {
                                        return (
                                            <Route
                                                key={adminPage.path}
                                                path={adminPage.path}
                                                element={adminPage.component}
                                            />     
                                        );
                                    })}
                                    <Route
                                        path="*"
                                        element={<Error404 />}
                                    />
                                </Routes>
                            </main>
                        </div>
                    </div>
                </div>
            </div>
        )
    )
}

const mapNavigateStateToAdmin = (navigateState) => ({
    adminPage: navigateState.adminPage
});

AdminLayout = connect(
    mapNavigateStateToAdmin,
    null
)(AdminLayout);

export default AdminLayout;